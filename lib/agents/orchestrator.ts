/**
 * Evaluation Orchestrator
 *
 * Coordinates all 5 agents through Band. Each agent reads Band context
 * from prior agents before posting its own findings — demonstrating
 * true Band-native multi-agent collaboration.
 */

import { db, ensureInit } from "@/lib/db"
import {
  candidates,
  jobs,
  evaluations,
  decisions,
  auditLogs,
} from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import * as band from "@/lib/band"
import { runResumeAnalyst } from "./resume-analyst"
import { runTechnicalEvaluator } from "./technical-evaluator"
import { runCultureEvaluator } from "./culture-evaluator"
import { runCompensationAgent } from "./compensation-agent"
import { runRankingAgent } from "./ranking-agent"
import type { EvalEvent, AgentType } from "@/lib/types"
import { randomUUID } from "crypto"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function now(): string {
  return new Date().toISOString()
}

export async function runEvaluation(
  candidateId: string,
  jobId: string,
  onEvent: (event: EvalEvent) => void
): Promise<void> {
  await ensureInit()

  const candidateRows = await db
    .select()
    .from(candidates)
    .where(eq(candidates.id, candidateId))
    .limit(1)
  const candidate = candidateRows[0]

  const jobRows = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1)
  const job = jobRows[0]

  if (!candidate || !job) {
    onEvent({ type: "error", message: "Candidate or job not found", timestamp: now() })
    return
  }

  if (candidate.status === "evaluating") {
    onEvent({ type: "error", message: "Evaluation already in progress for this candidate", timestamp: now() })
    return
  }

  // Clear existing evaluations so re-runs don't accumulate duplicate rows
  await db.delete(evaluations).where(
    and(eq(evaluations.candidateId, candidateId), eq(evaluations.jobId, jobId))
  )

  onEvent({
    type: "start",
    message: `Starting evaluation pipeline for ${candidate.name}`,
    timestamp: now(),
  })

  // ── Step 1: Ensure Band room exists for this job ─────────────────────────
  let bandRoomId = job.bandRoomId
  if (!bandRoomId) {
    const roomName = `hiring-${slugify(job.title)}`
    const room = await band.createRoom(roomName, `Hiring room for ${job.title}`)
    bandRoomId = room.id

    await db
      .update(jobs)
      .set({ bandRoomId, updatedAt: new Date() })
      .where(eq(jobs.id, jobId))

    onEvent({
      type: "band_post",
      message: `Band room created: ${roomName} (${band.bandMode} mode)`,
      data: { roomId: bandRoomId, mode: band.bandMode },
      timestamp: now(),
    })
  }

  // ── Step 2: Create candidate thread in Band ──────────────────────────────
  // A thread ID starting with "thread-" was created in mock mode and is not a
  // real Band chat ID. If we're now in live mode, replace it with a real one.
  let bandThreadId = candidate.bandThreadId
  const isMockThreadId = !bandThreadId || bandThreadId.startsWith("thread-")
  if (isMockThreadId && band.bandMode === "live") {
    bandThreadId = null
  }
  if (!bandThreadId) {
    const thread = await band.createThread(bandRoomId, `Evaluation: ${candidate.name}`)
    bandThreadId = thread.id
    await db
      .update(candidates)
      .set({ bandThreadId, status: "evaluating", updatedAt: new Date() })
      .where(eq(candidates.id, candidateId))
  } else {
    await db
      .update(candidates)
      .set({ status: "evaluating", updatedAt: new Date() })
      .where(eq(candidates.id, candidateId))
  }

  onEvent({
    type: "band_post",
    message: `Band thread opened: Evaluation: ${candidate.name}`,
    data: { threadId: bandThreadId, roomId: bandRoomId },
    timestamp: now(),
  })

  const ctx = {
    candidateId,
    jobId,
    candidate: candidate as Parameters<typeof runResumeAnalyst>[0]["candidate"],
    job: job as Parameters<typeof runResumeAnalyst>[0]["job"],
    bandRoomId,
    bandThreadId,
  }

  const agentSteps: Array<{
    type: AgentType
    label: string
    run: () => Promise<unknown>
  }> = [
    { type: "resume_analyst", label: "Resume Analyst", run: () => runResumeAnalyst(ctx) },
    { type: "technical_evaluator", label: "Technical Evaluator", run: () => runTechnicalEvaluator(ctx) },
    { type: "culture_evaluator", label: "Culture Evaluator", run: () => runCultureEvaluator(ctx) },
    { type: "compensation_agent", label: "Compensation Agent", run: () => runCompensationAgent(ctx) },
    { type: "ranking_agent", label: "Ranking Agent", run: () => runRankingAgent(ctx) },
  ]

  const agentOutputs: Record<string, unknown> = {}

  for (const step of agentSteps) {
    onEvent({
      type: "agent_start",
      agent: step.type,
      agentLabel: step.label,
      message: `${step.label} is analyzing...`,
      timestamp: now(),
    })

    if (step.type !== "resume_analyst") {
      const prevMessages = await band.fetchMessages(bandRoomId, bandThreadId)
      onEvent({
        type: "band_read",
        agent: step.type,
        agentLabel: step.label,
        message: `${step.label} reading ${prevMessages.length} message(s) from Band thread`,
        data: { count: prevMessages.length },
        timestamp: now(),
      })
    }

    try {
      const output = await step.run()
      agentOutputs[step.type] = output

      const evalOutput = output as Record<string, unknown>
      const score =
        (evalOutput.score as number) ??
        (evalOutput.compositeScore as number) ??
        null

      await db.insert(evaluations).values({
        id: randomUUID(),
        candidateId,
        jobId,
        agentType: step.type,
        output: JSON.stringify(output),
        score,
        createdAt: new Date(),
      })

      await db.insert(auditLogs).values({
        id: randomUUID(),
        entityType: "candidate",
        entityId: candidateId,
        action: `${step.type}_complete`,
        actorType: "agent",
        actorId: step.type,
        data: JSON.stringify({ score, bandRoomId, bandThreadId }),
        createdAt: new Date(),
      })

      onEvent({
        type: "band_post",
        agent: step.type,
        agentLabel: step.label,
        message: `${step.label} posted findings to Band thread`,
        timestamp: now(),
      })

      onEvent({
        type: "agent_complete",
        agent: step.type,
        agentLabel: step.label,
        message: `${step.label} complete`,
        score: typeof score === "number" ? score : undefined,
        data: output,
        timestamp: now(),
      })

      // ── Live Debate Mode ───────────────────────────────────────────────
      // After the culture evaluator finishes (and before the ranking agent),
      // surface a conflict if technical and culture scores diverge sharply.
      if (step.type === "culture_evaluator") {
        const techOutput = agentOutputs["technical_evaluator"] as
          | { score?: number }
          | undefined
        const cultureOutput = agentOutputs["culture_evaluator"] as
          | { score?: number }
          | undefined
        const techScore = techOutput?.score
        const cultureScore = cultureOutput?.score

        if (
          typeof techScore === "number" &&
          typeof cultureScore === "number" &&
          Math.abs(techScore - cultureScore) >= 1.5
        ) {
          const conflictMessage = `⚡ CONFLICT DETECTED: Technical score (${techScore.toFixed(
            1
          )}) vs Culture score (${cultureScore.toFixed(
            1
          )}). Ranking Agent reviewing conflict...`

          onEvent({
            type: "debate_start",
            message: conflictMessage,
            techScore,
            cultureScore,
            timestamp: now(),
          })

          await band.postMessage(
            bandRoomId,
            bandThreadId,
            "ranking_agent",
            conflictMessage,
            { techScore, cultureScore, event: "debate_start" }
          )
        }
      }
    } catch (err) {
      onEvent({
        type: "error",
        agent: step.type,
        agentLabel: step.label,
        message: `${step.label} failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        timestamp: now(),
      })
    }
  }

  // ── Persist final decision ───────────────────────────────────────────────
  const rankingOutput = agentOutputs["ranking_agent"] as {
    compositeScore: number
    decision: "HIRE" | "HOLD" | "REJECT"
    reasoning: string
    confidence: number
  } | null

  if (rankingOutput) {
    // Upsert decision — replace any prior decision so re-runs reflect fresh output
    await db.delete(decisions).where(
      and(eq(decisions.candidateId, candidateId), eq(decisions.jobId, jobId))
    )
    await db.insert(decisions).values({
      id: randomUUID(),
      candidateId,
      jobId,
      decision: rankingOutput.decision,
      reasoning: rankingOutput.reasoning,
      compositeScore: rankingOutput.compositeScore,
      confidence: rankingOutput.confidence,
      createdAt: new Date(),
    })

    const statusMap: Record<string, string> = {
      HIRE: "complete",
      HOLD: "hold",
      REJECT: "complete",
    }
    await db
      .update(candidates)
      .set({ status: statusMap[rankingOutput.decision] || "complete", updatedAt: new Date() })
      .where(eq(candidates.id, candidateId))
  } else {
    // Ranking agent failed — don't leave candidate stuck in "evaluating"
    await db
      .update(candidates)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(candidates.id, candidateId))
  }

  onEvent({
    type: "complete",
    message: `Evaluation complete. Decision: ${rankingOutput?.decision ?? "pending"}`,
    decision: rankingOutput?.decision,
    score: rankingOutput?.compositeScore,
    timestamp: now(),
  })
}
