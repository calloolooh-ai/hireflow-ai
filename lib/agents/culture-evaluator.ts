import { callAI, extractJSON, isDemoMode } from "@/lib/ai/client"
import * as band from "@/lib/band"
import type { AgentContext, CultureOutput } from "@/lib/types"

const SYSTEM_PROMPT = `You are a Culture Evaluator AI agent in a collaborative hiring system.
You evaluate cultural fit, soft skills, communication style, and team compatibility.
You read context from prior agents via Band before making assessments.
Always respond with valid JSON matching the specified schema.`

function buildPrompt(ctx: AgentContext, bandContext: string): string {
  return `Evaluate cultural fit for: ${ctx.job.title}

CANDIDATE: ${ctx.candidate.name}
RESUME: ${ctx.candidate.resumeText || "Not provided"}

BAND THREAD CONTEXT (from prior agents):
${bandContext}

JOB CONTEXT: ${ctx.job.department} team, ${ctx.job.level} level

Assess soft skills and culture fit. Return JSON:
{
  "score": <1-10 float>,
  "rationale": "culture fit assessment based on resume language and career trajectory",
  "communication": <1-10>,
  "leadership": <1-10>,
  "collaboration": <1-10>,
  "adaptability": <1-10>
}`
}

function getMockOutput(candidateName: string): CultureOutput {
  const seed = candidateName.charCodeAt(1) % 4
  const profiles = [
    {
      score: 8.8,
      rationale:
        "Resume demonstrates exceptional collaborative instincts — multiple references to team-led projects and cross-functional initiatives. Career progression at high-growth companies suggests strong adaptability. Leadership indicators present through team mentions.",
      communication: 9.0,
      leadership: 8.5,
      collaboration: 9.2,
      adaptability: 8.5,
    },
    {
      score: 7.5,
      rationale:
        "Solid culture indicators with focus on individual contribution. Technical depth suggests ability to mentor peers. Company history shows longevity and commitment — good cultural fit signal. Communication style from resume is clear and precise.",
      communication: 7.8,
      leadership: 7.0,
      collaboration: 7.5,
      adaptability: 7.7,
    },
    {
      score: 9.2,
      rationale:
        "Outstanding cultural signals throughout. Multiple leadership roles at previous companies. Open source contributions suggest community mindset. Writing quality in resume indicates strong communication. Growth from IC to lead shows exceptional adaptability.",
      communication: 9.5,
      leadership: 9.0,
      collaboration: 9.3,
      adaptability: 9.0,
    },
    {
      score: 6.5,
      rationale:
        "Adequate culture fit with room for growth. Resume focuses heavily on technical achievements with limited teamwork indicators. Communication style is functional. May need coaching on collaborative practices.",
      communication: 6.5,
      leadership: 5.8,
      collaboration: 6.5,
      adaptability: 7.0,
    },
  ]
  return profiles[seed]
}

export async function runCultureEvaluator(
  ctx: AgentContext
): Promise<CultureOutput> {
  // Read all prior agent messages from Band
  const messages = await band.fetchMessages(ctx.bandRoomId, ctx.bandThreadId)
  const bandContext = messages
    .map((m) => `[${m.agentType.replace("_", " ").toUpperCase()}]: ${m.content}`)
    .join("\n\n---\n\n")

  let output: CultureOutput

  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 700))
    output = getMockOutput(ctx.candidate.name)
  } else {
    const raw = await callAI(SYSTEM_PROMPT, buildPrompt(ctx, bandContext))
    output = extractJSON<CultureOutput>(raw)
  }

  const techMessage = messages.find((m) => m.agentType === "technical_evaluator")
  const techScore = (techMessage?.metadata?.output as { score?: number } | undefined)?.score
  const techRef = techScore !== undefined
    ? `Technical Evaluator's assessment (score ${techScore.toFixed(1)})`
    : "Technical Evaluator's assessment"

  const divergenceNote =
    techScore !== undefined && Math.abs(output.score - techScore) >= 1.5
      ? `\n⚠️ I must note my assessment diverges from ${techRef} — my culture score of ${output.score.toFixed(1)} differs by ${Math.abs(output.score - techScore).toFixed(1)} points. ${output.score < techScore ? "While technical skills are present, collaboration and communication signals raise significant concerns." : "Cultural indicators are stronger than technical signals suggest."}`
      : ""

  const messageContent = `**Culture Evaluation for ${ctx.candidate.name}**

I've read Resume Analyst's profile and ${techRef} from this Band thread (${messages.length} message(s) read). I am now evaluating culture fit independently.${divergenceNote}

**Culture Score: ${output.score.toFixed(1)}/10**

| Dimension | Score |
|-----------|-------|
| Communication | ${output.communication.toFixed(1)}/10 |
| Leadership | ${output.leadership.toFixed(1)}/10 |
| Collaboration | ${output.collaboration.toFixed(1)}/10 |
| Adaptability | ${output.adaptability.toFixed(1)}/10 |

**Assessment:** ${output.rationale}

*Compensation Agent and Ranking Agent: please read the full thread before proceeding.*`

  await band.postMessage(
    ctx.bandRoomId,
    ctx.bandThreadId,
    "culture_evaluator",
    messageContent,
    { output, candidateId: ctx.candidateId }
  )

  return output
}
