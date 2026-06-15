import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { candidates, jobs } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 })

  await ensureInit()
  const jobRows = await db.select({ userId: jobs.userId }).from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!jobRows[0] || jobRows[0].userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const list = await db
    .select()
    .from(candidates)
    .where(eq(candidates.jobId, jobId))
    .orderBy(desc(candidates.createdAt))

  return NextResponse.json({ candidates: list })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, email, jobId, resumeText, linkedinUrl } = body
  if (!name || !email || !jobId) {
    return NextResponse.json({ error: "name, email, jobId required" }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  await ensureInit()
  const jobOwner = await db.select({ userId: jobs.userId }).from(jobs).where(eq(jobs.id, jobId)).limit(1)
  if (!jobOwner[0] || jobOwner[0].userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const candidate = {
    id: randomUUID(),
    jobId,
    name,
    email,
    resumeText: resumeText || null,
    linkedinUrl: linkedinUrl || null,
    status: "pending",
    bandThreadId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.insert(candidates).values(candidate)
  return NextResponse.json({ candidate }, { status: 201 })
}
