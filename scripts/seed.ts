/**
 * Seed script — creates demo data for HireFlow AI
 * Run: npm run db:seed
 */
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "../lib/db/schema"

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema })

async function seed() {
  console.log("🌱 Seeding HireFlow AI database...")

  // Clear existing data
  await db.delete(schema.auditLogs)
  await db.delete(schema.decisions)
  await db.delete(schema.bandMessages)
  await db.delete(schema.evaluations)
  await db.delete(schema.candidates)
  await db.delete(schema.jobs)
  await db.delete(schema.users)

  // ── Demo user ────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("demo1234", 12)
  const userId = randomUUID()

  await db.insert(schema.users).values({
    id: userId,
    email: "demo@hireflow.ai",
    password: hashedPassword,
    name: "Alex Chen",
    role: "admin",
    createdAt: new Date(),
  })
  console.log("✓ Created demo user: demo@hireflow.ai / demo1234")

  // ── Jobs ─────────────────────────────────────────────────────────────────
  const jobData = [
    {
      id: randomUUID(),
      title: "Senior Frontend Engineer",
      department: "Engineering",
      level: "senior",
      location: "San Francisco, CA / Remote",
      description: `Senior Frontend Engineer to own our product UI. You'll lead the frontend architecture of our SaaS platform used by 50K+ companies.\n\nRequired: React, TypeScript, Next.js, GraphQL, CSS-in-JS\nNice to have: WebGL, Three.js, performance optimization\n5+ years frontend, 2+ years senior/lead.`,
      bandRoomId: "room-hiring-senior-frontend-engineer",
    },
    {
      id: randomUUID(),
      title: "Staff Backend Engineer",
      department: "Engineering",
      level: "staff",
      location: "New York, NY / Remote",
      description: `Staff Backend Engineer to lead our platform infrastructure team serving 10M+ daily requests.\n\nRequired: Go or Rust, Kubernetes, PostgreSQL, Redis, gRPC\nNice to have: eBPF, distributed tracing, Kafka\n8+ years backend, high-throughput systems experience.`,
      bandRoomId: "room-hiring-staff-backend-engineer",
    },
    {
      id: randomUUID(),
      title: "Senior Product Manager",
      department: "Product",
      level: "senior",
      location: "Remote",
      description: `Senior PM to own our enterprise product line. Define the roadmap, work with customers, partner with engineering.\n\nRequired: 4+ years PM at B2B SaaS, data-driven, strong communication\nNice to have: technical background, AI/ML products experience.`,
      bandRoomId: "room-hiring-senior-product-manager",
    },
  ]

  for (const job of jobData) {
    await db.insert(schema.jobs).values({
      ...job,
      userId,
      status: "active",
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    })
  }
  console.log(`✓ Created ${jobData.length} jobs`)

  // ── Candidates with pre-run evaluations ──────────────────────────────────
  const candidateData = [
    {
      jobIdx: 0,
      name: "Sarah Kim",
      email: "sarah.kim@example.com",
      resumeText: `Sarah Kim — Senior Frontend Engineer\nFigma (Staff, 2021–present): Led component library redesign, built collaborative editing used by 8M+ users\nStripe (Senior, 2018–2021): Architected React migration of Stripe Dashboard\nSkills: React, TypeScript, Next.js, GraphQL, WebGL, Performance\nEducation: B.S. CS, Stanford`,
      linkedinUrl: "https://linkedin.com/in/sarahkim",
      threadId: "thread-sarah-kim-eval",
      decision: "HIRE" as const,
      techScore: 9.2,
      cultureScore: 8.8,
      compScore: 9.0,
      minSalary: 185000,
      maxSalary: 235000,
    },
    {
      jobIdx: 0,
      name: "Marcus Johnson",
      email: "marcus.j@example.com",
      resumeText: `Marcus Johnson — Frontend Engineer\nNotion (Senior, 2022–present): Built drag-and-drop editor, improved core web vitals 68→91\nIntercom (Mid, 2019–2022): Customer-facing messenger widget\nSkills: React, TypeScript, CSS, Webpack, some GraphQL\nEducation: B.S. CS, UC Davis`,
      linkedinUrl: null,
      threadId: "thread-marcus-johnson-eval",
      decision: "HOLD" as const,
      techScore: 7.2,
      cultureScore: 7.5,
      compScore: 7.3,
      minSalary: 140000,
      maxSalary: 170000,
    },
    {
      jobIdx: 0,
      name: "Priya Patel",
      email: "priya.patel@example.com",
      resumeText: `Priya Patel — Frontend Developer\n3 years experience. React, JavaScript, HTML/CSS, some TypeScript.\nCurrently at startup building admin dashboard.\nPrevious: bootcamp grad, junior dev at agency.`,
      linkedinUrl: null,
      threadId: "thread-priya-patel-eval",
      decision: "REJECT" as const,
      techScore: 5.5,
      cultureScore: 6.8,
      compScore: 5.8,
      minSalary: 90000,
      maxSalary: 115000,
    },
    {
      jobIdx: 1,
      name: "David Chen",
      email: "david.chen@example.com",
      resumeText: `David Chen — Staff Infrastructure Engineer\nDatadog (Principal, 2020–present): Ingestion pipeline 2TB/day, auto-scaling framework\nCloudflare (Staff, 2017–2020): Core contributor to Workers runtime\nSkills: Go, Rust, Kubernetes, PostgreSQL, Redis, Kafka, eBPF, gRPC\nEducation: M.S. CS, MIT`,
      linkedinUrl: "https://linkedin.com/in/davidchen",
      threadId: "thread-david-chen-eval",
      decision: "HIRE" as const,
      techScore: 9.5,
      cultureScore: 8.2,
      compScore: 9.1,
      minSalary: 230000,
      maxSalary: 290000,
    },
    {
      jobIdx: 1,
      name: "Emma Rodriguez",
      email: "emma.r@example.com",
      resumeText: `Emma Rodriguez — Backend Engineer\nPlaid (Senior, 2021–present): Financial data aggregation in Go, reduced API latency 40%\nSegment (Mid, 2018–2021): High-throughput event pipeline 100K events/sec\nSkills: Go, Python, PostgreSQL, Redis, Docker, Kubernetes basics\nEducation: B.S. CS, UT Austin`,
      linkedinUrl: null,
      threadId: "thread-emma-rodriguez-eval",
      decision: "HOLD" as const,
      techScore: 7.8,
      cultureScore: 8.5,
      compScore: 7.9,
      minSalary: 175000,
      maxSalary: 215000,
    },
  ]

  for (const cand of candidateData) {
    const job = jobData[cand.jobIdx]
    const candId = randomUUID()
    const threadId = cand.threadId
    const baseTime = new Date(Date.now() - 2 * 60 * 60 * 1000)

    const statusMap = { HIRE: "hired", HOLD: "hold", REJECT: "rejected" }

    await db.insert(schema.candidates).values({
      id: candId,
      jobId: job.id,
      name: cand.name,
      email: cand.email,
      resumeText: cand.resumeText,
      linkedinUrl: cand.linkedinUrl,
      status: statusMap[cand.decision],
      bandThreadId: threadId,
      createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    })

    // Band messages
    const bandMsgs = [
      {
        agentType: "resume_analyst",
        content: `**Resume Analysis Complete for ${cand.name}**\n\n**Skills Identified:** React, TypeScript, Next.js, GraphQL, Performance Optimization\n**Years of Experience:** ${cand.techScore >= 8.5 ? "7-9" : cand.techScore >= 7 ? "4-6" : "2-3"}\n**Strengths:**\n• Strong technical background in required stack\n• Proven delivery at top-tier companies\n• Clear career progression\n\n*Resume Analyst posted findings. Technical Evaluator should review before scoring.*`,
        delay: 0,
        metadata: { candidateId: candId, output: { skills: ["React", "TypeScript", "Next.js"], yearsExperience: 7 } },
      },
      {
        agentType: "technical_evaluator",
        content: `**Technical Evaluation for ${cand.name}**\n\n*Read 1 message(s) from Band thread before evaluating.*\n\n**Technical Score: ${cand.techScore.toFixed(1)}/10**\n\n**Rationale:** Based on Resume Analyst's findings posted to Band, candidate demonstrates ${cand.techScore >= 8.5 ? "exceptional" : cand.techScore >= 7 ? "solid" : "moderate"} technical alignment.\n\n**Technical Strengths:**\n• ${cand.techScore >= 8 ? "Deep expertise in required stack" : "Foundational skills present"}\n• ${cand.techScore >= 8 ? "Experience with scale and performance" : "Limited production scale experience"}\n\n*Technical Evaluator complete. Culture Evaluator should now read this thread.*`,
        delay: 120000,
        metadata: { candidateId: candId, output: { score: cand.techScore } },
      },
      {
        agentType: "culture_evaluator",
        content: `**Culture Evaluation for ${cand.name}**\n\n*Read 2 message(s) from Band thread. Considered technical findings before assessing culture.*\n\n**Culture Score: ${cand.cultureScore.toFixed(1)}/10**\n\n| Dimension | Score |\n|-----------|-------|\n| Communication | ${(cand.cultureScore + 0.2).toFixed(1)}/10 |\n| Leadership | ${(cand.cultureScore - 0.3).toFixed(1)}/10 |\n| Collaboration | ${(cand.cultureScore + 0.1).toFixed(1)}/10 |\n| Adaptability | ${cand.cultureScore.toFixed(1)}/10 |\n\n*Culture Evaluator complete. Compensation Agent has sufficient context.*`,
        delay: 240000,
        metadata: { candidateId: candId, output: { score: cand.cultureScore } },
      },
      {
        agentType: "compensation_agent",
        content: `**Compensation Estimate for ${cand.name}**\n\n*Analyzed 3 Band messages to calibrate experience level.*\n\n**Salary Range: $${Math.round(cand.minSalary / 1000)}K – $${Math.round(cand.maxSalary / 1000)}K**\n**Market Position:** at market\n**Confidence:** 82%\n\n**Factors Considered:**\n• ${job.level} level in ${job.department}\n• Location: ${job.location}\n• ${cand.techScore >= 8.5 ? "9" : cand.techScore >= 7 ? "6" : "3"} years experience\n\n*Compensation Agent complete. Ranking Agent now has all data needed.*`,
        delay: 360000,
        metadata: { candidateId: candId, output: { minSalary: cand.minSalary, maxSalary: cand.maxSalary, confidence: 0.82 } },
      },
      {
        agentType: "ranking_agent",
        content: `**FINAL HIRING RECOMMENDATION: ${cand.decision === "HIRE" ? "✅ HIRE" : cand.decision === "HOLD" ? "⏸️ HOLD" : "❌ REJECT"}**\n**Candidate:** ${cand.name}\n**Composite Score:** ${cand.compScore.toFixed(1)}/10 (Confidence: ${cand.decision === "HIRE" ? "87" : cand.decision === "HOLD" ? "72" : "81"}%)\n\n*Synthesized findings from 4 agent messages in this Band thread.*\n\n**Scoring Weights:** Technical 55% | Culture 45%\n\n**Evidence-Based Reasoning:**\nTechnical Evaluator scored ${cand.techScore.toFixed(1)}/10, Culture Evaluator scored ${cand.cultureScore.toFixed(1)}/10. ${cand.decision === "HIRE" ? "All signals strongly positive." : cand.decision === "HOLD" ? "Mixed signals — recommend further assessment." : "Insufficient experience for this level."}\n\n---\n*Decision requires human approval.*`,
        delay: 480000,
        metadata: { candidateId: candId, output: { compositeScore: cand.compScore, decision: cand.decision } },
      },
    ]

    for (const msg of bandMsgs) {
      await db.insert(schema.bandMessages).values({
        id: randomUUID(),
        roomId: job.bandRoomId!,
        threadId,
        agentType: msg.agentType,
        content: msg.content,
        metadata: JSON.stringify(msg.metadata),
        createdAt: new Date(baseTime.getTime() + msg.delay),
      })
    }

    // Evaluations
    const agentEvals = [
      { type: "resume_analyst", score: null, output: { skills: ["React", "TypeScript", "Next.js"], yearsExperience: 7, strengths: ["Strong background"], summary: "Experienced engineer.", education: ["B.S. CS"], companies: ["Top Company"] } },
      { type: "technical_evaluator", score: cand.techScore, output: { score: cand.techScore, rationale: "Strong technical fit.", strengths: ["Deep expertise"], gaps: cand.decision === "REJECT" ? ["Limited experience"] : [], keywordMatches: ["React", "TypeScript"] } },
      { type: "culture_evaluator", score: cand.cultureScore, output: { score: cand.cultureScore, rationale: "Good culture indicators.", communication: cand.cultureScore + 0.2, leadership: cand.cultureScore - 0.3, collaboration: cand.cultureScore + 0.1, adaptability: cand.cultureScore } },
      { type: "compensation_agent", score: null, output: { minSalary: cand.minSalary, maxSalary: cand.maxSalary, confidence: 0.82, marketRate: "at market", factors: ["Level", "Location", "Experience"] } },
      { type: "ranking_agent", score: cand.compScore, output: { compositeScore: cand.compScore, decision: cand.decision, reasoning: `Technical ${cand.techScore.toFixed(1)}/10, Culture ${cand.cultureScore.toFixed(1)}/10.`, confidence: 0.87, technicalWeight: 0.55, cultureWeight: 0.45, highlights: ["Strong candidate"], concerns: cand.decision === "REJECT" ? ["Insufficient level"] : [] } },
    ]

    for (let i = 0; i < agentEvals.length; i++) {
      const e = agentEvals[i]
      await db.insert(schema.evaluations).values({
        id: randomUUID(),
        candidateId: candId,
        jobId: job.id,
        agentType: e.type,
        output: JSON.stringify(e.output),
        score: e.score,
        createdAt: new Date(baseTime.getTime() + i * 120000),
      })
    }

    // Decision
    await db.insert(schema.decisions).values({
      id: randomUUID(),
      candidateId: candId,
      jobId: job.id,
      decision: cand.decision,
      reasoning: `Technical ${cand.techScore.toFixed(1)}/10, Culture ${cand.cultureScore.toFixed(1)}/10. Composite: ${cand.compScore.toFixed(1)}/10.`,
      compositeScore: cand.compScore,
      confidence: 0.87,
      humanDecision: cand.decision === "HIRE" ? "approve" : null,
      approvedBy: cand.decision === "HIRE" ? userId : null,
      approvedAt: cand.decision === "HIRE" ? new Date() : null,
      createdAt: new Date(baseTime.getTime() + 600000),
    })

    // Audit logs
    for (let i = 0; i < agentEvals.length; i++) {
      const e = agentEvals[i]
      await db.insert(schema.auditLogs).values({
        id: randomUUID(),
        entityType: "candidate",
        entityId: candId,
        action: `${e.type}_complete`,
        actorType: "agent",
        actorId: e.type,
        data: JSON.stringify({ score: e.score }),
        createdAt: new Date(baseTime.getTime() + i * 120000),
      })
    }
  }

  console.log(`✓ Created ${candidateData.length} candidates with full evaluations and Band messages`)
  console.log("\n✅ Seed complete!")
  console.log("\nDemo credentials:")
  console.log("  Email: demo@hireflow.ai")
  console.log("  Password: demo1234")
  console.log("\nStart: npm run dev")

  await client.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
