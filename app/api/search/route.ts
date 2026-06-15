import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { candidates, jobs, decisions } from "@/lib/db/schema"
import { like, or, eq, and, inArray } from "drizzle-orm"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  await ensureInit()
  const pattern = `%${q}%`

  const matchingJobs = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, session.user.id), or(like(jobs.title, pattern), like(jobs.department, pattern), like(jobs.description, pattern))))
    .limit(5)

  const userJobIds = matchingJobs.length > 0
    ? matchingJobs.map((j) => j.id)
    : (await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.userId, session.user.id))).map((j) => j.id)

  const matchingCandidates = userJobIds.length > 0
    ? await db
        .select()
        .from(candidates)
        .where(and(
          inArray(candidates.jobId, userJobIds),
          or(like(candidates.name, pattern), like(candidates.email, pattern), like(candidates.resumeText, pattern))
        ))
        .limit(5)
    : []

  let decisionMatches: typeof candidates.$inferSelect[] = []
  const upper = q.toUpperCase()
  if (["HIRE", "HOLD", "REJECT"].includes(upper) && userJobIds.length > 0) {
    const matchingDecisions = await db
      .select()
      .from(decisions)
      .innerJoin(candidates, eq(candidates.id, decisions.candidateId))
      .where(and(eq(decisions.decision, upper), inArray(candidates.jobId, userJobIds)))
      .limit(5)

    decisionMatches = matchingDecisions.map((r) => r.candidates)
  }

  const allCandidates = [
    ...matchingCandidates,
    ...decisionMatches.filter((d) => !matchingCandidates.some((c) => c.id === d.id)),
  ]

  return NextResponse.json({
    results: {
      jobs: matchingJobs.map((j) => ({ type: "job", ...j })),
      candidates: allCandidates.map((c) => ({ type: "candidate", ...c })),
    },
  })
}
