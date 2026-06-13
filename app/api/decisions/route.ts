import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { decisions, auditLogs, candidates } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
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

  if (candidateId) {
    const rows = await db.select().from(decisions).where(eq(decisions.candidateId, candidateId)).limit(1)
    return NextResponse.json({ decision: rows[0] })
  }

  const allDecisions = await db.select().from(decisions)
  return NextResponse.json({ decisions: allDecisions })
}
