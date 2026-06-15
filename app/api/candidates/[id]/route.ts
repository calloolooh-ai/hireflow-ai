import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { candidates, jobs } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

async function getOwnedCandidate(candidateId: string, userId: string) {
  const rows = await db
    .select({ candidate: candidates })
    .from(candidates)
    .innerJoin(jobs, and(eq(jobs.id, candidates.jobId), eq(jobs.userId, userId)))
    .where(eq(candidates.id, candidateId))
    .limit(1)
  return rows[0]?.candidate ?? null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { id } = await params
  const candidate = await getOwnedCandidate(id, session.user.id)
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ candidate })
}

const ALLOWED_CANDIDATE_FIELDS = ["name", "email", "resumeText", "linkedinUrl", "status"] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { id } = await params
  const candidate = await getOwnedCandidate(id, session.user.id)
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()
  const update: Record<string, unknown> = { updatedAt: new Date() }
  for (const field of ALLOWED_CANDIDATE_FIELDS) {
    if (field in body) update[field] = body[field]
  }

  await db.update(candidates).set(update).where(eq(candidates.id, id))
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { id } = await params
  const candidate = await getOwnedCandidate(id, session.user.id)
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.delete(candidates).where(eq(candidates.id, id))
  return NextResponse.json({ success: true })
}
