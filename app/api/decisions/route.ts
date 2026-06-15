import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { decisions, auditLogs, candidates, jobs, evaluations } from "@/lib/db/schema"
import { eq, and, inArray, isNull } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { candidateId, action } = await request.json()
  if (!candidateId || !action) {
    return NextResponse.json({ error: "candidateId and action required" }, { status: 400 })
  }
  if (!["approve", "reject", "review"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  await ensureInit()

  const candidateRows = await db
    .select({ candidate: candidates })
    .from(candidates)
    .innerJoin(jobs, and(eq(jobs.id, candidates.jobId), eq(jobs.userId, session.user.id)))
    .where(eq(candidates.id, candidateId))
    .limit(1)
  if (!candidateRows[0]) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await db
    .update(decisions)
    .set({ humanDecision: action, approvedBy: session.user.id, approvedAt: new Date() })
    .where(eq(decisions.candidateId, candidateId))

  const statusMap: Record<string, string> = {
    approve: "hired",
    reject: "rejected",
    review: "hold",
  }
  await db
    .update(candidates)
    .set({ status: statusMap[action], updatedAt: new Date() })
    .where(eq(candidates.id, candidateId))

  await db.insert(auditLogs).values({
    id: randomUUID(),
    entityType: "candidate",
    entityId: candidateId,
    action: `human_${action}`,
    actorType: "human",
    actorId: session.user.id,
    data: JSON.stringify({ action }),
    createdAt: new Date(),
  })

  return NextResponse.json({ success: true })
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get("candidateId")
  const pendingApproval = searchParams.get("pendingApproval") === "true"

  if (pendingApproval) {
    const rows = await db
      .select({
        candidateId: candidates.id,
        candidateName: candidates.name,
        jobTitle: jobs.title,
        decision: decisions.decision,
        compositeScore: decisions.compositeScore,
        reasoning: decisions.reasoning,
        humanDecision: decisions.humanDecision,
        createdAt: decisions.createdAt,
      })
      .from(decisions)
      .innerJoin(candidates, eq(candidates.id, decisions.candidateId))
      .innerJoin(jobs, and(eq(jobs.id, candidates.jobId), eq(jobs.userId, session.user.id)))
      .where(isNull(decisions.humanDecision))

    const sorted = rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const candidateIds = sorted.map((r) => r.candidateId)
    const evalRows = candidateIds.length > 0
      ? await db
          .select({ candidateId: evaluations.candidateId, agentType: evaluations.agentType, output: evaluations.output, score: evaluations.score })
          .from(evaluations)
          .where(inArray(evaluations.candidateId, candidateIds))
      : []

    const evalsByCandidate = new Map<string, typeof evalRows>()
    for (const e of evalRows) {
      const list = evalsByCandidate.get(e.candidateId) ?? []
      list.push(e)
      evalsByCandidate.set(e.candidateId, list)
    }

    const pending = sorted.map((r) => {
      const evals = evalsByCandidate.get(r.candidateId) ?? []
      const tech = evals.find((e) => e.agentType === "technical_evaluator")
      const culture = evals.find((e) => e.agentType === "culture_evaluator")

      let strengths: string[] = []
      let weaknesses: string[] = []
      let technicalScore: number | null = tech?.score ?? null
      let cultureScore: number | null = culture?.score ?? null

      if (tech?.output) {
        try {
          const parsed = JSON.parse(tech.output)
          if (Array.isArray(parsed.strengths)) strengths = parsed.strengths.slice(0, 3)
          if (Array.isArray(parsed.weaknesses)) weaknesses = parsed.weaknesses.slice(0, 3)
        } catch { /* ignore */ }
      }

      let cultureReasoning: string | null = null
      if (culture?.output) {
        try {
          const parsed = JSON.parse(culture.output)
          if (parsed.reasoning) cultureReasoning = String(parsed.reasoning)
          else if (parsed.rationale) cultureReasoning = String(parsed.rationale)
        } catch { /* ignore */ }
      }

      return {
        candidateId: r.candidateId,
        candidateName: r.candidateName,
        jobTitle: r.jobTitle,
        decision: r.decision,
        summary: {
          compositeScore: r.compositeScore ?? null,
          technicalScore,
          cultureScore,
          strengths,
          weaknesses,
          rankingReasoning: r.reasoning ?? null,
          cultureReasoning,
        },
      }
    })

    return NextResponse.json({ pending })
  }

  if (candidateId) {
    const owned = await db
      .select({ id: candidates.id })
      .from(candidates)
      .innerJoin(jobs, and(eq(jobs.id, candidates.jobId), eq(jobs.userId, session.user.id)))
      .where(eq(candidates.id, candidateId))
      .limit(1)
    if (!owned[0]) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const rows = await db.select().from(decisions).where(eq(decisions.candidateId, candidateId)).limit(1)
    return NextResponse.json({ decision: rows[0] })
  }

  const userJobs = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.userId, session.user.id))
  if (userJobs.length === 0) return NextResponse.json({ decisions: [] })
  const jobIds = userJobs.map((j) => j.id)
  const allDecisions = await db.select().from(decisions).where(inArray(decisions.jobId, jobIds))
  return NextResponse.json({ decisions: allDecisions })
}
