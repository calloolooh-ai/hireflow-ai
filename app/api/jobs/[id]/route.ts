import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { id } = await params
  const rows = await db.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, session.user.id))).limit(1)

  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ job: rows[0] })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { id } = await params
  const body = await request.json()
  const ALLOWED = ["title", "department", "level", "location", "description", "status"] as const
  const update: Record<string, unknown> = { updatedAt: new Date() }
  for (const field of ALLOWED) {
    if (field in body) update[field] = body[field]
  }

  await db
    .update(jobs)
    .set(update)
    .where(and(eq(jobs.id, id), eq(jobs.userId, session.user.id)))

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
  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, session.user.id)))
  return NextResponse.json({ success: true })
}
