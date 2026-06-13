import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { candidates } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { id } = await params
  const rows = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1)
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ candidate: rows[0] })
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
  await db.update(candidates).set({ ...body, updatedAt: new Date() }).where(eq(candidates.id, id))
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
  await db.delete(candidates).where(eq(candidates.id, id))
  return NextResponse.json({ success: true })
}
