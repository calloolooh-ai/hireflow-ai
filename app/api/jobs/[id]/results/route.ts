import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { jobs, candidates, evaluations, decisions, auditLogs, bandMessages } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { id: jobId } = await params

  const jobRows = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!jobRows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const job = jobRows[0]
  if (job.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const candidateList = await db
    .select()
    .from(candidates)
    .where(eq(candidates.jobId, jobId))
    .orderBy(desc(candidates.createdAt))

  const candidatesWithData = await Promise.all(
    candidateList.map(async (c) => {
      const evals = await db
        .select()
        .from(evaluations)
        .where(eq(evaluations.candidateId, c.id))
      const decisionRows = await db
        .select()
        .from(decisions)
        .where(eq(decisions.candidateId, c.id))
        .limit(1)
      return { ...c, evaluations: evals, decision: decisionRows[0] || undefined }
    })
  )

  let bandMsgs: typeof bandMessages.$inferSelect[] = []
  if (job.bandRoomId) {
    bandMsgs = await db
      .select()
      .from(bandMessages)
      .where(eq(bandMessages.roomId, job.bandRoomId))
      .orderBy(bandMessages.createdAt)
  }

  const candidateIds = candidateList.map((c) => c.id)
  const allAudit: typeof auditLogs.$inferSelect[] = []
  for (const cid of candidateIds) {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, cid))
    allAudit.push(...logs)
  }
  allAudit.sort((a, b) => {
    const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : Number(a.createdAt)
    const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : Number(b.createdAt)
    return tb - ta
  })

  return NextResponse.json({
    job,
    candidates: candidatesWithData,
    bandMessages: bandMsgs,
    auditLogs: allAudit,
  })
}
