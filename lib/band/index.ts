/**
 * Band Integration Layer
 *
 * Band is the collaboration backbone between agents. Agents post findings,
 * read context from previous agents, and coordinate through Band threads.
 *
 * When BAND_API_KEY is set, uses the real Band API.
 * Otherwise, falls back to SQLite-backed mock that preserves all semantics.
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

const isBandEnabled =
  !!process.env.BAND_API_KEY && process.env.BAND_API_KEY !== ""

const BAND_BASE_URL = process.env.BAND_API_URL || "https://api.band.dev/v1"

async function bandFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BAND_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BAND_API_KEY}`,
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Band API error ${res.status}: ${err}`)
  }
  return res.json()
}

export async function createRoom(
  name: string,
  description?: string
): Promise<BandRoom> {
  if (isBandEnabled) {
    return bandFetch("/rooms", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
  }
  const id = `room-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
  return { id, name, description }
}

export async function createThread(
  roomId: string,
  title: string
): Promise<BandThread> {
  if (isBandEnabled) {
    return bandFetch(`/rooms/${roomId}/threads`, {
      method: "POST",
      body: JSON.stringify({ title }),
    })
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
  if (isBandEnabled) {
    const msg = await bandFetch(
      `/rooms/${roomId}/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ agentType, content, metadata }),
      }
    )
    return { ...msg, createdAt: new Date(msg.createdAt) }
  }

  await ensureInit()
  const id = randomUUID()
  const now = new Date()
  await db.insert(bandMessages).values({
    id,
    roomId,
    threadId,
    agentType,
    content,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: now,
  })

  return { id, roomId, threadId, agentType, content, metadata, createdAt: now }
}

export async function fetchMessages(
  roomId: string,
  threadId: string
): Promise<BandMessage[]> {
  if (isBandEnabled) {
    const msgs = await bandFetch(
      `/rooms/${roomId}/threads/${threadId}/messages`
    )
    return msgs.map((m: BandMessage & { createdAt: string }) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }))
  }

  await ensureInit()
  const rows = await db
    .select()
    .from(bandMessages)
    .where(
      and(
        eq(bandMessages.roomId, roomId),
        eq(bandMessages.threadId, threadId)
      )
    )

  return rows.map((r) => ({
    id: r.id,
    roomId: r.roomId,
    threadId: r.threadId,
    agentType: r.agentType,
    content: r.content,
    metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt as number),
  }))
}

export async function fetchAllThreadMessages(
  roomId: string
): Promise<BandMessage[]> {
  if (isBandEnabled) {
    return bandFetch(`/rooms/${roomId}/messages`)
  }

  await ensureInit()
  const rows = await db
    .select()
    .from(bandMessages)
    .where(eq(bandMessages.roomId, roomId))

  return rows.map((r) => ({
    id: r.id,
    roomId: r.roomId,
    threadId: r.threadId,
    agentType: r.agentType,
    content: r.content,
    metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt as number),
  }))
}

export const bandMode = isBandEnabled ? "live" : "mock"
