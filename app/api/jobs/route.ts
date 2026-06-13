import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { jobs, candidates } from "@/lib/db/schema"
import { eq, desc, count } from "drizzle-orm"
import { randomUUID } from "crypto"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const jobList = await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, session.user.id))
    .orderBy(desc(jobs.createdAt))

  const jobsWithCount = await Promise.all(
    jobList.map(async (job) => {
      const [{ count: candidateCount }] = await db
        .select({ count: count() })
        .from(candidates)
        .where(eq(candidates.jobId, job.id))
      return { ...job, candidateCount }
    })
  )

  return NextResponse.json({ jobs: jobsWithCount })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { title, department, level, location, description } = body

  if (!title || !department || !level || !location || !description) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 })
  }

  await ensureInit()
  const job = {
    id: randomUUID(),
    userId: session.user.id,
    title,
    department,
    level,
    location,
    description,
    status: "active",
    bandRoomId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.insert(jobs).values(job)
  return NextResponse.json({ job }, { status: 201 })
}
