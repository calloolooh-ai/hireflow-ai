import { callAI, extractJSON, isDemoMode } from "@/lib/ai/client"
import * as band from "@/lib/band"
import type { AgentContext, TechnicalOutput, ResumeOutput } from "@/lib/types"

const SYSTEM_PROMPT = `You are a Technical Evaluator AI agent in a collaborative hiring system.
You receive context from the Resume Analyst via Band and evaluate technical fit.
Always respond with valid JSON matching the specified schema.`

function buildPrompt(
  ctx: AgentContext,
  resumeFindings: ResumeOutput | null,
  bandContext: string
): string {
  return `Evaluate the technical fit for: ${ctx.job.title}

JOB DESCRIPTION:
${ctx.job.description}

Level: ${ctx.job.level} | Department: ${ctx.job.department}

BAND CONTEXT (from Resume Analyst):
${bandContext}

${resumeFindings ? `EXTRACTED SKILLS: ${resumeFindings.skills.join(", ")}` : ""}

Score the candidate 1-10 on technical fit and return JSON:
{
  "score": <1-10 float>,
  "rationale": "detailed technical assessment",
  "strengths": ["technical strength 1", "technical strength 2"],
  "gaps": ["skill gap 1", "skill gap 2"],
  "keywordMatches": ["matched keywords from job description"]
}`
}

function getMockOutput(
  candidateName: string,
  resumeOutput: ResumeOutput | null
): TechnicalOutput {
  const seed = candidateName.charCodeAt(0) % 4
  const scores = [8.5, 7.2, 9.1, 6.8]
  const score = scores[seed]

  const gaps = resumeOutput
    ? ["Docker/Kubernetes orchestration", "CI/CD pipeline management"].filter(
        (g) => !resumeOutput.skills.some((s) => s.toLowerCase().includes(g.split("/")[0].toLowerCase()))
      )
    : ["Some required technologies not confirmed"]

  return {
    score,
    rationale: `Based on the Resume Analyst's findings posted to Band, the candidate demonstrates ${
      score >= 8 ? "strong" : score >= 7 ? "solid" : "moderate"
    } technical alignment with the role. Their experience with ${
      resumeOutput?.skills.slice(0, 3).join(", ") || "key technologies"
    } directly maps to our stack requirements.`,
    strengths: resumeOutput
      ? [
          `Proficient in ${resumeOutput.skills.slice(0, 2).join(" and ")}`,
          `${resumeOutput.yearsExperience} years of relevant experience`,
          "Strong problem-solving indicators from resume",
        ]
      : ["Technical background aligns with role", "Relevant industry experience"],
    gaps,
    keywordMatches: resumeOutput?.skills.slice(0, 5) || [],
  }
}

export async function runTechnicalEvaluator(
  ctx: AgentContext
): Promise<TechnicalOutput> {
  // Read Resume Analyst's findings from Band — this is Band-native collaboration
  const messages = await band.fetchMessages(ctx.bandRoomId, ctx.bandThreadId)
  const resumeMessage = messages.find((m) => m.agentType === "resume_analyst")
  const resumeFindings = resumeMessage?.metadata?.output as ResumeOutput | null

  let output: TechnicalOutput

  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 900))
    output = getMockOutput(ctx.candidate.name, resumeFindings)
  } else {
    const bandContext = resumeMessage?.content || "No prior agent context available"
    const raw = await callAI(SYSTEM_PROMPT, buildPrompt(ctx, resumeFindings, bandContext))
    output = extractJSON<TechnicalOutput>(raw)
  }

  // Post evaluation back to Band for downstream agents
  const messageContent = `**Technical Evaluation for ${ctx.candidate.name}**

*Read ${messages.length} message(s) from Band thread before evaluating.*

**Technical Score: ${output.score.toFixed(1)}/10**

**Rationale:** ${output.rationale}

**Technical Strengths:**
${output.strengths.map((s) => `• ${s}`).join("\n")}

**Skill Gaps:**
${output.gaps.length ? output.gaps.map((g) => `• ${g}`).join("\n") : "• No significant gaps identified"}

**Job Keyword Matches:** ${output.keywordMatches.join(", ")}

*Technical Evaluator complete. Culture Evaluator should now read this thread.*`

  await band.postMessage(
    ctx.bandRoomId,
    ctx.bandThreadId,
    "technical_evaluator",
    messageContent,
    { output, candidateId: ctx.candidateId }
  )

  return output
}
