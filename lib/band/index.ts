/**
 * Band Integration Layer
 *
 * Band is the collaboration backbone between agents. Each of the five hiring
 * agents is a SEPARATE Band External Agent identity, so the Band chat shows
 * five distinct senders collaborating — with real @mention handoffs down the
 * pipeline (Resume Analyst → Technical Evaluator → … → Ranking Agent).
 *
 * REAL API (Band Agent API — https://docs.band.ai/api/agent-api):
 *   Base URL : https://app.band.ai/api/v1/agent
 *   Auth     : X-API-Key header (each agent uses its OWN key)
 *   Model    : flat "chats" (no room→thread nesting). One Band chat per
 *              candidate evaluation. Every message must @mention a participant.
 *
 * MAPPING (HireFlow → Band):
 *   room    → synthetic local id (Band has no room-above-chat concept)
 *   thread  → a real Band chat (POST /chats → data.id). The lead agent
 *             (Resume Analyst) creates it and adds the other agents as members.
 *   message → POST /chats/{chatId}/messages, sent with the posting agent's key,
 *             mentioning the next agent in the pipeline.
 *
 * Every post is ALSO mirrored to the local `band_messages` table. The results
 * UI reads from that table, and the mirror is the fallback that keeps the
 * pipeline working if a Band call fails. When the agent keys are not all
 * configured, the adapter runs purely against the mirror (mock mode).
 */

import { db, ensureInit } from "@/lib/db"
import { bandMessages } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { randomUUID } from "crypto"

export interface BandRoom {
  id: string
  name: string
  description?: string
}

export interface BandThread {
  id: string
  roomId: string
  title: string
}

export interface BandMessage {
  id: string
  roomId: string
  threadId: string
  agentType: string
  content: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// ── Per-agent credentials ────────────────────────────────────────────────────

type RoleKey =
  | "resume_analyst"
  | "technical_evaluator"
  | "culture_evaluator"
  | "compensation_agent"
  | "ranking_agent"

// Order is the pipeline order; each agent @mentions the next one in it.
const PIPELINE: RoleKey[] = [
  "resume_analyst",
  "technical_evaluator",
  "culture_evaluator",
  "compensation_agent",
  "ranking_agent",
]

interface AgentCreds {
  key: string
  id: string
}

const ENV_PREFIX: Record<RoleKey, string> = {
  resume_analyst: "BAND_RESUME_ANALYST",
  technical_evaluator: "BAND_TECHNICAL_EVALUATOR",
  culture_evaluator: "BAND_CULTURE_EVALUATOR",
  compensation_agent: "BAND_COMPENSATION_AGENT",
  ranking_agent: "BAND_RANKING_AGENT",
}

const AGENTS: Record<RoleKey, AgentCreds> = PIPELINE.reduce((acc, role) => {
  const p = ENV_PREFIX[role]
  acc[role] = {
    key: process.env[`${p}_KEY`] || "",
    id: process.env[`${p}_ID`] || "",
  }
  return acc
}, {} as Record<RoleKey, AgentCreds>)

// Who the Ranking Agent hands off to for human approval (User UUID or Agent ID).
const REVIEWER_ID = process.env.BAND_REVIEWER_ID || ""

// The lead agent creates the chat and reads it back.
const LEAD: RoleKey = "resume_analyst"

const BAND_BASE_URL =
  process.env.BAND_API_URL || "https://app.band.ai/api/v1/agent"

// Live only when every agent has a key — otherwise we'd post a partial,
// confusing chat. Missing config → mock mode (DB mirror only).
const isBandEnabled = PIPELINE.every((r) => !!AGENTS[r].key)

export const bandMode = isBandEnabled ? "live" : "mock"

// Reverse lookup: Band sender id → role, used as a fallback on read.
const ID_TO_ROLE = new Map<string, RoleKey>(
  PIPELINE.filter((r) => AGENTS[r].id).map((r) => [AGENTS[r].id, r])
)

function agentKey(role: string): string {
  return AGENTS[role as RoleKey]?.key || AGENTS[LEAD].key
}

// The id this agent should @mention: the next agent in the pipeline, or the
// reviewer (falling back to the lead) for the final Ranking Agent.
function nextMentionId(role: string): string | null {
  const i = PIPELINE.indexOf(role as RoleKey)
  if (i >= 0 && i < PIPELINE.length - 1) return AGENTS[PIPELINE[i + 1]].id || null
  return REVIEWER_ID || AGENTS[LEAD].id || null
}

// ── Band API helper ──────────────────────────────────────────────────────────

async function bandFetch<T = unknown>(
  path: string,
  apiKey: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BAND_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Band API error ${res.status}: ${err}`)
  }
  if (res.status === 204) return undefined as T
  const json = await res.json()
  // Band wraps payloads in a top-level `data` key.
  return (json?.data ?? json) as T
}

// Hidden marker so we can recover which logical agent authored a message after
// a Band round-trip. Rendered as an HTML comment (invisible in markdown) and
// stripped before the content is shown or handed to other agents.
const AGENT_MARKER_RE = /<!--\s*hireflow:agent=([a-z_]+)\s*-->/i

function tagContent(agentType: string, content: string): string {
  return `${content}\n\n<!-- hireflow:agent=${agentType} -->`
}

function parseAgentType(
  content: string,
  senderId: string | undefined,
  fallback: string
): string {
  return (
    content.match(AGENT_MARKER_RE)?.[1] ??
    (senderId ? ID_TO_ROLE.get(senderId) : undefined) ??
    fallback
  )
}

function stripMarker(content: string): string {
  return content.replace(AGENT_MARKER_RE, "").trimEnd()
}

// ── DB mirror (source of truth for the UI + fail-soft fallback) ───────────────

function rowToMessage(r: typeof bandMessages.$inferSelect): BandMessage {
  return {
    id: r.id,
    roomId: r.roomId,
    threadId: r.threadId,
    agentType: r.agentType,
    content: r.content,
    metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt
        : new Date(r.createdAt as unknown as number),
  }
}

async function mirrorMessages(
  roomId: string,
  threadId: string
): Promise<BandMessage[]> {
  await ensureInit()
  const rows = await db
    .select()
    .from(bandMessages)
    .where(
      and(eq(bandMessages.roomId, roomId), eq(bandMessages.threadId, threadId))
    )
  return rows.map(rowToMessage)
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createRoom(
  name: string,
  description?: string
): Promise<BandRoom> {
  // Band has no room-above-chat concept; the room is a local grouping handle.
  const id = `room-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
  return { id, name, description }
}

export async function createThread(
  roomId: string,
  title: string
): Promise<BandThread> {
  if (isBandEnabled) {
    // The lead agent creates the chat; its id becomes our threadId.
    const chat = await bandFetch<{ id: string }>("/chats", AGENTS[LEAD].key, {
      method: "POST",
      body: JSON.stringify({ chat: {} }),
    })

    // Add the rest of the pipeline (+ optional reviewer) as members so they
    // are valid @mention targets. Best-effort: failures are logged, not fatal.
    const memberIds = [
      ...PIPELINE.filter((r) => r !== LEAD).map((r) => AGENTS[r].id),
      REVIEWER_ID,
    ].filter(Boolean)

    for (const participantId of memberIds) {
      try {
        await bandFetch(
          `/chats/${chat.id}/participants`,
          AGENTS[LEAD].key,
          {
            method: "POST",
            body: JSON.stringify({
              participant: { participant_id: participantId, role: "member" },
            }),
          }
        )
      } catch (err) {
        console.error(
          `[band] failed to add participant ${participantId} to chat ${chat.id}:`,
          err instanceof Error ? err.message : err
        )
      }
    }

    return { id: chat.id, roomId, title }
  }

  const id = `thread-${randomUUID().slice(0, 8)}`
  return { id, roomId, title }
}

export async function postMessage(
  roomId: string,
  threadId: string,
  agentType: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<BandMessage> {
  await ensureInit()
  const id = randomUUID()
  const now = new Date()

  // Always mirror to the DB first: keeps the UI populated and guarantees the
  // pipeline has context even if the Band call below fails.
  await db.insert(bandMessages).values({
    id,
    roomId,
    threadId,
    agentType,
    content,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: now,
  })

  if (isBandEnabled) {
    try {
      const mentionId = nextMentionId(agentType)
      const mentions = mentionId ? [{ id: mentionId }] : []
      await bandFetch(
        `/chats/${threadId}/messages`,
        agentKey(agentType),
        {
          method: "POST",
          body: JSON.stringify({
            message: { content: tagContent(agentType, content), mentions },
          }),
        }
      )
    } catch (err) {
      // Fail soft: the message is already mirrored, so collaboration and the
      // UI continue. Surface the problem in logs for debugging the live wiring.
      console.error(
        `[band] live post failed for ${agentType} in chat ${threadId}:`,
        err instanceof Error ? err.message : err
      )
    }
  }

  return { id, roomId, threadId, agentType, content, metadata, createdAt: now }
}

export async function fetchMessages(
  roomId: string,
  threadId: string
): Promise<BandMessage[]> {
  const mirror = await mirrorMessages(roomId, threadId)

  if (!isBandEnabled) return mirror

  try {
    const raw = await bandFetch<
      Array<{
        id: string
        content: string
        sender_id?: string
        sender_type?: string
        inserted_at?: string
      }>
    >(`/chats/${threadId}/messages`, AGENTS[LEAD].key)
    const list = Array.isArray(raw) ? raw : []
    const mapped: BandMessage[] = list.map((m) => ({
      id: m.id,
      roomId,
      threadId,
      agentType: parseAgentType(
        m.content ?? "",
        m.sender_id,
        m.sender_type === "Agent" ? "agent" : "participant"
      ),
      content: stripMarker(m.content ?? ""),
      createdAt: m.inserted_at ? new Date(m.inserted_at) : new Date(),
    }))

    // If Band hasn't yet returned all of our agent posts (eventual
    // consistency, a failed post, or a shape mismatch), use the complete local
    // mirror so agents never lose prior context.
    const liveOurCount = list.filter((m) =>
      AGENT_MARKER_RE.test(m.content ?? "")
    ).length
    return liveOurCount >= mirror.length && mapped.length > 0 ? mapped : mirror
  } catch (err) {
    console.error(
      `[band] live read failed for chat ${threadId}, using mirror:`,
      err instanceof Error ? err.message : err
    )
    return mirror
  }
}

export async function fetchAllThreadMessages(
  roomId: string
): Promise<BandMessage[]> {
  // Always served from the local mirror — the results UI reads this table and
  // it spans every thread (candidate) under the room (job).
  await ensureInit()
  const rows = await db
    .select()
    .from(bandMessages)
    .where(eq(bandMessages.roomId, roomId))
  return rows.map(rowToMessage)
}
