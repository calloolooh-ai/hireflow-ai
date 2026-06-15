import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { jobs, candidates } from "@/lib/db/schema"
import { randomUUID } from "crypto"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await ensureInit()

  const jobId = randomUUID()
  const nowDate = new Date()

  await db.insert(jobs).values({
    id: jobId,
    userId: session.user.id,
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    level: "senior",
    location: "San Francisco / Remote",
    description:
      "We're hiring a Senior Full-Stack Engineer to lead development across our React/Next.js frontend and Node.js/PostgreSQL backend. You'll architect scalable systems, mentor engineers, and drive technical decisions for our multi-agent platform. Strong TypeScript, cloud (AWS/GCP), and system design skills required.",
    status: "active",
    bandRoomId: null,
    createdAt: nowDate,
    updatedAt: nowDate,
  })

  const demoCandidates = [
    {
      name: "Maya Chen",
      email: "maya.chen@example.com",
      resumeText:
        "Senior full-stack engineer with 8 years building production React and Node.js applications at scale. Led the rebuild of a payments platform serving 5M users on Next.js and PostgreSQL. Deep expertise in TypeScript, AWS, distributed systems, and mentoring engineering teams.",
    },
    {
      name: "Diego Ramirez",
      email: "diego.ramirez@example.com",
      resumeText:
        "Full-stack developer with 5 years of experience focused on frontend-heavy products using React, Vue, and GraphQL. Shipped several customer-facing dashboards and design systems. Growing backend skills in Node.js and exploring cloud infrastructure on GCP.",
    },
    {
      name: "Priya Nair",
      email: "priya.nair@example.com",
      resumeText:
        "Backend-leaning engineer with 7 years building high-throughput APIs in Go and Node.js, with PostgreSQL and Kafka. Architected event-driven microservices for a logistics company. Comfortable with TypeScript on the frontend but prefers systems and data-intensive work.",
    },
  ]

  for (const c of demoCandidates) {
    await db.insert(candidates).values({
      id: randomUUID(),
      jobId,
      name: c.name,
      email: c.email,
      resumeText: c.resumeText,
      linkedinUrl: null,
      status: "pending",
      bandThreadId: null,
      createdAt: nowDate,
      updatedAt: nowDate,
    })
  }

  return NextResponse.json({ jobId })
}
