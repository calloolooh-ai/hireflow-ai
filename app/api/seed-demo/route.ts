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
  const nowDate = new Date()
  const userId = session.user.id

  // ── Job 1: Senior Full-Stack Engineer ────────────────────────────────────
  const job1Id = randomUUID()
  await db.insert(jobs).values({
    id: job1Id,
    userId,
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    level: "senior",
    location: "San Francisco / Remote",
    description:
      "We're hiring a Senior Full-Stack Engineer to lead development across our React/Next.js frontend and Node.js/PostgreSQL backend. You'll architect scalable systems, mentor junior engineers, and drive technical decisions for our multi-agent AI platform. Strong TypeScript, AWS/GCP cloud, and system design experience required. 6+ years preferred.",
    status: "active",
    bandRoomId: null,
    createdAt: nowDate,
    updatedAt: nowDate,
  })

  const job1Candidates = [
    {
      name: "Maya Chen",
      email: "maya.chen@example.com",
      linkedinUrl: "https://linkedin.com/in/maya-chen",
      resumeText:
        "Senior full-stack engineer with 8 years building production React and Node.js applications at scale. Led the complete rebuild of a payments platform serving 5M daily active users using Next.js, TypeScript, and PostgreSQL. Deep expertise in AWS (ECS, RDS, Lambda), distributed systems design, and mentoring engineering teams of 6+. Strong communicator — ran weekly cross-functional syncs with Product and Design. Thrives in ambiguous, fast-moving startup environments.",
    },
    {
      name: "Diego Ramirez",
      email: "diego.ramirez@example.com",
      linkedinUrl: "https://linkedin.com/in/diego-ramirez-dev",
      resumeText:
        "Full-stack developer with 5 years of experience primarily on frontend-heavy products. Built and shipped several customer-facing dashboards and component libraries in React, Vue, and GraphQL. Growing backend skills in Node.js and exploring cloud infrastructure on GCP. Prefers working solo and asynchronously — found team collaboration challenging at previous startup. Limited experience with system design or production incident response.",
    },
    {
      name: "Priya Nair",
      email: "priya.nair@example.com",
      linkedinUrl: "https://linkedin.com/in/priya-nair-eng",
      resumeText:
        "Backend-focused engineer with 7 years building high-throughput APIs in Go and Node.js, with PostgreSQL, Redis, and Kafka. Architected event-driven microservices processing 50K events/sec for a logistics company. TypeScript proficient on the frontend but prefers systems and data-intensive work. Highly collaborative — led knowledge-sharing sessions and wrote extensive internal documentation. Experience mentoring 3 junior engineers.",
    },
    {
      name: "James Okafor",
      email: "james.okafor@example.com",
      linkedinUrl: null,
      resumeText:
        "Full-stack engineer with 6 years at large enterprises (Goldman Sachs, IBM). Strong Java and Spring Boot background with recent shift to TypeScript and React over the last 2 years. Solid understanding of system design patterns and enterprise-scale architecture. Communication style is formal and process-driven — may need adjustment to startup pace. No direct cloud-native experience; all work done in on-premise data centers.",
    },
    {
      name: "Aisha Kovacs",
      email: "aisha.kovacs@example.com",
      linkedinUrl: "https://linkedin.com/in/aisha-kovacs",
      resumeText:
        "Self-taught full-stack engineer, 3 years of experience. Built and scaled two indie SaaS products to $15K MRR using Next.js, Supabase, and Stripe — entirely solo. Strong product instincts and extremely fast shipping velocity. Collaborative and proactive communicator, regularly blogs about technical decisions. Weaker on distributed systems and large-team engineering practices, but eager to grow in those areas.",
    },
  ]

  // ── Job 2: Product Designer ───────────────────────────────────────────────
  const job2Id = randomUUID()
  await db.insert(jobs).values({
    id: job2Id,
    userId,
    title: "Senior Product Designer",
    department: "Design",
    level: "senior",
    location: "New York / Remote",
    description:
      "Looking for a Senior Product Designer to own the end-to-end design of our AI hiring platform. You'll work closely with Engineering and Product to design intuitive interfaces for complex multi-agent workflows. Proficiency in Figma, strong systems thinking, and experience shipping B2B SaaS products required. 5+ years preferred.",
    status: "active",
    bandRoomId: null,
    createdAt: nowDate,
    updatedAt: nowDate,
  })

  const job2Candidates = [
    {
      name: "Sofia Andersen",
      email: "sofia.andersen@example.com",
      linkedinUrl: "https://linkedin.com/in/sofia-andersen-design",
      resumeText:
        "Senior product designer with 7 years designing B2B SaaS products, most recently at Notion and Linear. Built and maintained a design system used by 12 engineers. Expert in Figma, strong in user research and accessibility. Excellent communicator — ran weekly design reviews and stakeholder presentations. Deep experience making complex data-heavy workflows approachable for non-technical users.",
    },
    {
      name: "Raj Patel",
      email: "raj.patel@example.com",
      linkedinUrl: "https://linkedin.com/in/raj-patel-ux",
      resumeText:
        "UX designer with 4 years of experience across consumer mobile apps. Strong visual design skills and excellent taste. Less experience with B2B or enterprise products — all prior work was consumer-facing. Strong collaborator, frequently praised by PMs and engineers. Limited exposure to design systems or data-dense UI patterns.",
    },
    {
      name: "Lena Müller",
      email: "lena.muller@example.com",
      linkedinUrl: null,
      resumeText:
        "Product designer with 6 years at fintech companies. Deep expertise in designing for compliance-heavy, data-rich enterprise dashboards. Proficient in Figma, Sketch, and Principle. Thorough and research-driven process but slower velocity — took 3 months to ship a redesign that initially scoped for 6 weeks. Thoughtful and detail-oriented team player.",
    },
  ]

  const allCandidates = [
    ...job1Candidates.map((c) => ({ ...c, jobId: job1Id })),
    ...job2Candidates.map((c) => ({ ...c, jobId: job2Id })),
  ]

  for (const c of allCandidates) {
    await db.insert(candidates).values({
      id: randomUUID(),
      jobId: c.jobId,
      name: c.name,
      email: c.email,
      resumeText: c.resumeText,
      linkedinUrl: c.linkedinUrl,
      status: "pending",
      bandThreadId: null,
      createdAt: nowDate,
      updatedAt: nowDate,
    })
  }

  return NextResponse.json({ jobId: job1Id, job2Id })
}
