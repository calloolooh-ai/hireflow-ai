import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { jobs, candidates, evaluations, decisions } from "@/lib/db/schema"
import { eq, desc, count, inArray } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const userId = session.user.id

  const userJobs = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.userId, userId))
  const userJobIds = userJobs.map((j) => j.id)

  const userCandidateIds = userJobIds.length > 0
    ? (await db.select({ id: candidates.id }).from(candidates).where(inArray(candidates.jobId, userJobIds))).map((c) => c.id)
    : []

  const [{ count: activeJobs }] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.userId, userId))

  const [{ count: totalCandidates }] = userJobIds.length > 0
    ? await db.select({ count: count() }).from(candidates).where(inArray(candidates.jobId, userJobIds))
    : [{ count: 0 }]

  const [{ count: evaluationsCompleted }] = userCandidateIds.length > 0
    ? await db.select({ count: count() }).from(evaluations).where(inArray(evaluations.candidateId, userCandidateIds))
    : [{ count: 0 }]

  const [{ count: hiresRecommended }] = userCandidateIds.length > 0
    ? await db.select({ count: count() }).from(decisions).where(inArray(decisions.candidateId, userCandidateIds))
    : [{ count: 0 }]

  const allDecisions = userCandidateIds.length > 0
    ? await db.select().from(decisions).where(inArray(decisions.candidateId, userCandidateIds))
    : []
  const hireCount = allDecisions.filter((d) => d.decision === "HIRE").length
  const holdCount = allDecisions.filter((d) => d.decision === "HOLD").length
  const rejectCount = allDecisions.filter((d) => d.decision === "REJECT").length

  const decisionBreakdown = [
    { name: "Hire", value: hireCount, color: "#10b981" },
    { name: "Hold", value: holdCount, color: "#f59e0b" },
    { name: "Reject", value: rejectCount, color: "#ef4444" },
  ]

  const allJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt))
    .limit(5)

  const avgScoresByJob = await Promise.all(
    allJobs.map(async (job) => {
      const jobEvals = await db
        .select()
        .from(evaluations)
        .where(eq(evaluations.jobId, job.id))

      const avg = (arr: number[]) =>
        arr.length
          ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1))
          : 0

      return {
        name: job.title.length > 15 ? job.title.slice(0, 15) + "…" : job.title,
        technical: avg(
          jobEvals.filter((e) => e.agentType === "technical_evaluator" && e.score !== null).map((e) => e.score!)
        ),
        culture: avg(
          jobEvals.filter((e) => e.agentType === "culture_evaluator" && e.score !== null).map((e) => e.score!)
        ),
        composite: avg(
          jobEvals.filter((e) => e.agentType === "ranking_agent" && e.score !== null).map((e) => e.score!)
        ),
      }
    })
  )

  const allEvals = userCandidateIds.length > 0
    ? await db.select().from(evaluations).where(inArray(evaluations.candidateId, userCandidateIds))
    : []

  const skillCounts: Record<string, number> = {}
  for (const evalRow of allEvals.filter((e) => e.agentType === "resume_analyst")) {
    try {
      const output = JSON.parse(evalRow.output)
      for (const skill of output.skills || []) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      }
    } catch {
      // skip
    }
  }
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }))

  const hiringVelocity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    const nextD = new Date(d)
    nextD.setDate(nextD.getDate() + 1)

    const dayEvals = allEvals.filter((e) => {
      const t =
        e.createdAt instanceof Date
          ? e.createdAt.getTime()
          : Number(e.createdAt) * (Number(e.createdAt) < 1e12 ? 1000 : 1)
      return t >= d.getTime() && t < nextD.getTime()
    })

    return {
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      evaluations: dayEvals.length,
    }
  })

  return NextResponse.json({
    activeJobs,
    totalCandidates,
    evaluationsCompleted,
    hiresRecommended,
    decisionBreakdown,
    avgScoresByJob,
    topSkills,
    hiringVelocity,
  })
}
