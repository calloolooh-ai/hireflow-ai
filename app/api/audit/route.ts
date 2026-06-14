import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { auditLogs, jobs, candidates } from "@/lib/db/schema"
import { desc, eq, inArray } from "drizzle-orm"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50") || 50, 100)

  const userId = session.user.id
  const userJobs = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.userId, userId))
  const jobIds = userJobs.map((j) => j.id)

  if (jobIds.length === 0) return NextResponse.json({ logs: [] })

  const userCandidates = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(inArray(candidates.jobId, jobIds))
  const candidateIds = userCandidates.map((c) => c.id)

  const entityIds = [...jobIds, ...candidateIds]

  const logs = await db
    .select()
    .from(auditLogs)
    .where(inArray(auditLogs.entityId, entityIds))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)

  return NextResponse.json({ logs })
}
