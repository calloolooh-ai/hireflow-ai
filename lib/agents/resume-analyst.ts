import { callAI, extractJSON, isDemoMode } from "@/lib/ai/client"
import * as band from "@/lib/band"
import type { AgentContext, ResumeOutput } from "@/lib/types"

const SYSTEM_PROMPT = `You are a Resume Analyst AI agent in a collaborative hiring system.
Your job is to extract structured information from resumes.
Always respond with valid JSON matching the specified schema.`

function buildPrompt(ctx: AgentContext): string {
  return `Analyze this resume for the position: ${ctx.job.title} at ${ctx.job.department} level ${ctx.job.level}.

RESUME:
${ctx.candidate.resumeText || "No resume provided"}

LinkedIn: ${ctx.candidate.linkedinUrl || "Not provided"}

Extract and return JSON with this exact structure:
{
  "skills": ["list", "of", "technical", "skills"],
  "yearsExperience": <number>,
  "strengths": ["key", "professional", "strengths"],
  "summary": "2-3 sentence professional summary",
  "education": ["degree and institution"],
  "companies": ["previous employers"]
}`
}

const MOCK_OUTPUTS: Record<string, ResumeOutput> = {
  default: {
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL", "Next.js"],
    yearsExperience: 7,
    strengths: [
      "Full-stack expertise with modern web technologies",
      "Strong distributed systems background",
      "Proven track record leading engineering teams",
    ],
    summary:
      "Experienced full-stack engineer with 7 years building scalable web applications. Led teams of 4-8 engineers at Series B startups. Deep expertise in React ecosystem and cloud-native architectures.",
    education: ["B.S. Computer Science, UC Berkeley"],
    companies: ["Stripe", "Figma", "Airbnb"],
  },
}

function getMockOutput(candidateName: string): ResumeOutput {
  const seed = candidateName.charCodeAt(0) % 3
  const variations: ResumeOutput[] = [
    {
      skills: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Spark", "Kubernetes"],
      yearsExperience: 5,
      strengths: ["ML/AI expertise", "Data pipeline architecture", "Research background"],
      summary:
        "ML engineer with 5 years building production AI systems. PhD research in NLP. Shipped models serving 10M+ daily predictions at scale.",
      education: ["M.S. Machine Learning, Carnegie Mellon"],
      companies: ["Google DeepMind", "OpenAI", "Meta AI"],
    },
    {
      skills: ["Go", "Rust", "Kubernetes", "Terraform", "AWS", "Redis", "Kafka", "gRPC"],
      yearsExperience: 9,
      strengths: ["Systems programming", "Infrastructure at scale", "On-call reliability"],
      summary:
        "Staff-level backend engineer focused on high-performance systems. Built infrastructure handling 100K RPS at Datadog. Open source contributor to Kubernetes.",
      education: ["B.S. Electrical Engineering, MIT"],
      companies: ["Datadog", "Cloudflare", "Netflix"],
    },
    MOCK_OUTPUTS.default,
  ]
  return variations[seed]
}

export async function runResumeAnalyst(
  ctx: AgentContext
): Promise<ResumeOutput> {
  let output: ResumeOutput

  if (isDemoMode) {
    // Simulate analysis delay
    await new Promise((r) => setTimeout(r, 800))
    output = getMockOutput(ctx.candidate.name)
  } else {
    const raw = await callAI(SYSTEM_PROMPT, buildPrompt(ctx))
    output = extractJSON<ResumeOutput>(raw)
  }

  // Post findings to Band thread — other agents will read this
  const messageContent = `**Resume Analysis Complete for ${ctx.candidate.name}**

**Skills Identified:** ${output.skills.join(", ")}
**Years of Experience:** ${output.yearsExperience}
**Education:** ${output.education.join("; ")}
**Previous Companies:** ${output.companies.join(", ")}

**Strengths:**
${output.strengths.map((s) => `• ${s}`).join("\n")}

**Summary:** ${output.summary}

*Resume Analyst has posted findings. Technical Evaluator should review before scoring.*`

  await band.postMessage(
    ctx.bandRoomId,
    ctx.bandThreadId,
    "resume_analyst",
    messageContent,
    { output, candidateId: ctx.candidateId }
  )

  return output
}
