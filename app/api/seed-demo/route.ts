import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { jobs, candidates, evaluations, bandMessages, decisions } from "@/lib/db/schema"
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
        "Full-stack developer with 5 years of experience primarily on frontend-heavy products. Expert-level JavaScript/TypeScript — built complex real-time WebSocket systems, automated CI/CD pipelines on GCP, and shipped multiple high-performance React dashboards and component libraries. Deep GraphQL expertise and growing Node.js backend skills. However, explicitly avoids meetings and cross-functional communication. Self-describes as 'not a team player' and strongly prefers zero collaboration or pair programming. Has been noted in past performance reviews for communication breakdowns with PMs and designers. Struggled severely in collaborative settings at two previous companies, leading to early departure from one role. No experience with production incident response or on-call rotations.",
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

  // ── Jordan Lee: pre-evaluated conflict demo candidate ──────────────────────
  // Tech 9.1 / Culture 5.4 → gap of 3.7 → always triggers debate mode
  const jordanId = randomUUID()
  const jordanThreadId = "thread-jordan-lee-conflict-demo"
  const jordanBandRoomId = "room-hiring-senior-fullstack"

  await db.insert(candidates).values({
    id: jordanId,
    jobId: job1Id,
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    resumeText:
      "Jordan Lee — Staff Backend Engineer\nAmazon (Staff, 2019–present): Led DynamoDB scaling initiative, maintained 99.999% uptime across 50+ services\nMeta (Senior, 2016–2019): Core infrastructure for Stories feature at 500M DAU scale\nSkills: Go, Java, Distributed Systems, PostgreSQL, Kafka, Redis, Kubernetes\nEducation: B.S. CS, Carnegie Mellon University\nNote: Exceptional technical execution but 360 feedback indicates recurring friction in cross-team collaborations.",
    linkedinUrl: null,
    status: "hold",
    bandThreadId: jordanThreadId,
    createdAt: nowDate,
    updatedAt: nowDate,
  })

  // Evaluations
  await db.insert(evaluations).values([
    {
      id: randomUUID(),
      candidateId: jordanId,
      jobId: job1Id,
      agentType: "resume_analyst",
      output: JSON.stringify({ skills: ["Go", "Java", "Kubernetes", "PostgreSQL", "Kafka", "Redis"], yearsExperience: 9, summary: "Senior backend engineer with exceptional scale experience at Amazon and Meta." }),
      score: null,
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      candidateId: jordanId,
      jobId: job1Id,
      agentType: "technical_evaluator",
      output: JSON.stringify({ score: 9.1, strengths: ["DynamoDB scaling at Amazon", "Production systems at Meta scale", "Deep Kafka/distributed systems"], weaknesses: ["Limited frontend exposure"], rationale: "Exceptional technical depth. One of the strongest backend engineers reviewed." }),
      score: 9.1,
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      candidateId: jordanId,
      jobId: job1Id,
      agentType: "culture_evaluator",
      output: JSON.stringify({ score: 5.4, reasoning: "360 feedback from two companies documents significant collaboration friction. Pattern of working in isolation, avoiding cross-functional meetings.", concerns: ["Recurring friction in cross-team settings", "Avoids collaborative design sessions", "Two prior companies noted communication breakdown with PMs"] }),
      score: 5.4,
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      candidateId: jordanId,
      jobId: job1Id,
      agentType: "compensation_agent",
      output: JSON.stringify({ minSalary: 220000, maxSalary: 280000, confidence: 0.85 }),
      score: null,
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      candidateId: jordanId,
      jobId: job1Id,
      agentType: "ranking_agent",
      output: JSON.stringify({ decision: "HOLD", compositeScore: 7.2, highlights: ["Exceptional technical score (9.1)", "Culture concerns documented across multiple employers", "Structured behavioral interview recommended"] }),
      score: 7.2,
      createdAt: nowDate,
    },
  ])

  // Band messages including debate_start
  await db.insert(bandMessages).values([
    {
      id: randomUUID(),
      roomId: jordanBandRoomId,
      threadId: jordanThreadId,
      agentType: "resume_analyst",
      content: `**Resume Analysis Complete for Jordan Lee**\n\n**Skills Identified:** Go, Java, Kubernetes, PostgreSQL, Kafka, Redis, Distributed Systems\n**Years of Experience:** 9\n**Strengths:**\n• Staff-level experience at Amazon and Meta\n• Proven delivery at massive scale (500M DAU)\n• Deep systems expertise\n\n*Resume Analyst posted findings. Technical Evaluator should review before scoring.*`,
      metadata: JSON.stringify({ candidateId: jordanId, output: { skills: ["Go", "Java", "Kubernetes", "PostgreSQL", "Kafka"], yearsExperience: 9 } }),
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      roomId: jordanBandRoomId,
      threadId: jordanThreadId,
      agentType: "technical_evaluator",
      content: `**Technical Evaluation for Jordan Lee**\n\n*Read 1 message from Band thread before evaluating.*\n\n**Technical Score: 9.1/10**\n\nBased on Resume Analyst's findings, Jordan demonstrates exceptional technical alignment.\n\n• DynamoDB scaling at Amazon (50+ services, 99.999% uptime)\n• Core infrastructure at Meta for Stories (500M DAU)\n• Deep distributed systems expertise: Kafka, Redis, Kubernetes\n\n*One of the strongest backend candidates reviewed. Technical Evaluator complete.*`,
      metadata: JSON.stringify({ candidateId: jordanId, output: { score: 9.1 }, band_messages_read: 1 }),
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      roomId: jordanBandRoomId,
      threadId: jordanThreadId,
      agentType: "culture_evaluator",
      content: `**Culture Evaluation for Jordan Lee**\n\n*Read 2 messages from Band thread. Considered technical findings before assessing culture.*\n\n**Culture Score: 5.4/10**\n\n| Dimension | Score |\n|-----------|-------|\n| Communication | 5.1/10 |\n| Leadership | 5.8/10 |\n| Collaboration | 4.9/10 |\n| Adaptability | 5.8/10 |\n\n⚠ 360 feedback from two companies documents collaboration friction\n⚠ Pattern of avoiding cross-functional meetings and design sessions\n⚠ Communication breakdown noted with PMs at prior employers\n\n*Culture Evaluator complete. Note: Significant gap between technical (9.1) and culture (5.4) scores.*`,
      metadata: JSON.stringify({ candidateId: jordanId, output: { score: 5.4 }, band_messages_read: 2 }),
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      roomId: jordanBandRoomId,
      threadId: jordanThreadId,
      agentType: "debate_start",
      content: "Technical Evaluator scored 9.1 but Culture Evaluator scored 5.4 — a 3.7-point gap requiring mediation. Ranking Agent will review all evidence before issuing a final decision.",
      metadata: JSON.stringify({ candidateId: jordanId, techScore: 9.1, cultureScore: 5.4 }),
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      roomId: jordanBandRoomId,
      threadId: jordanThreadId,
      agentType: "compensation_agent",
      content: `**Compensation Estimate for Jordan Lee**\n\n*Analyzed 4 Band messages to calibrate experience level.*\n\n**Salary Range: $220K – $280K**\n**Market Position:** above market (staff-level)\n**Confidence:** 85%\n\n• 9 years experience, staff-level impact\n• Location: San Francisco / Remote\n• Amazon + Meta pedigree commands premium\n\n*Compensation Agent complete. Ranking Agent now has all data including conflict signal.*`,
      metadata: JSON.stringify({ candidateId: jordanId, output: { minSalary: 220000, maxSalary: 280000, confidence: 0.85 }, band_messages_read: 3 }),
      createdAt: nowDate,
    },
    {
      id: randomUUID(),
      roomId: jordanBandRoomId,
      threadId: jordanThreadId,
      agentType: "ranking_agent",
      content: `**Final Ranking Decision for Jordan Lee**\n\n*Read 5 messages from Band — including conflict signal between Technical (9.1) and Culture (5.4) evaluations.*\n\nCONFLICT: Technical scored 9.1 but Culture scored 5.4 — a 3.7-point gap requiring mediation. Technical strength is real and well-documented at Amazon and Meta scale. However, collaboration concerns are documented across multiple 360 feedback cycles from two separate employers.\n\n**Decision: HOLD**\n**Composite Score: 7.2/10**\n\nStructured behavioral interview panel recommended before advancing. The technical upside is significant — if culture concerns can be addressed or context provided, this candidate could move to HIRE.\n\n✓ Recommended next step: Panel interview with 3+ team members including cross-functional partners`,
      metadata: JSON.stringify({ candidateId: jordanId, output: { decision: "HOLD", compositeScore: 7.2 }, band_messages_read: 5 }),
      createdAt: nowDate,
    },
  ])

  // Decision record
  await db.insert(decisions).values({
    id: randomUUID(),
    candidateId: jordanId,
    jobId: job1Id,
    decision: "HOLD",
    reasoning: "CONFLICT: Technical scored 9.1 but Culture scored 5.4 — a 3.7-point gap. Technical strength is real but collaboration concerns documented across multiple employers. Structured behavioral interview recommended.",
    compositeScore: 7.2,
    confidence: 0.78,
    humanDecision: null,
    createdAt: nowDate,
  })

  return NextResponse.json({ jobId: job1Id, job2Id })
}
