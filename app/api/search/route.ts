import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { candidates, jobs, decisions } from "@/lib/db/schema"
import { like, or, eq } from "drizzle-orm"

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
    .where(or(like(jobs.title, pattern), like(jobs.department, pattern), like(jobs.description, pattern)))
    .limit(5)

  const matchingCandidates = await db
    .select()
    .from(candidates)
    .where(or(like(candidates.name, pattern), like(candidates.email, pattern), like(candidates.resumeText, pattern)))
    .limit(5)

  let decisionMatches: typeof candidates.$inferSelect[] = []
  const upper = q.toUpperCase()
  if (["HIRE", "HOLD", "REJECT"].includes(upper)) {
    const matchingDecisions = await db
      .select()
      .from(decisions)
      .where(eq(decisions.decision, upper))
      .limit(5)

    for (const d of matchingDecisions) {
      const rows = await db.select().from(candidates).where(eq(candidates.id, d.candidateId)).limit(1)
      if (rows[0]) decisionMatches.push(rows[0])
    }
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
