import { callAI, extractJSON, isDemoMode } from "@/lib/ai/client"
import * as band from "@/lib/band"
import type { AgentContext, CompensationOutput, ResumeOutput } from "@/lib/types"

const SYSTEM_PROMPT = `You are a Compensation Intelligence Agent in a collaborative hiring system.
You estimate fair market salary ranges based on experience, skills, level, and location.
You read prior agent findings from Band to factor in experience level.
Always respond with valid JSON matching the specified schema.`

function buildPrompt(
  ctx: AgentContext,
  bandContext: string
): string {
  return `Estimate compensation for: ${ctx.job.title}

Level: ${ctx.job.level}
Location: ${ctx.job.location}
Department: ${ctx.job.department}

BAND CONTEXT (skills and experience from prior agents):
${bandContext}

Return JSON with salary estimate in USD:
{
  "minSalary": <number>,
  "maxSalary": <number>,
  "confidence": <0-1 float>,
  "marketRate": "below market | at market | above market",
  "factors": ["factor influencing estimate"]
}`
}

const LEVEL_BASE: Record<string, [number, number]> = {
  junior: [75000, 110000],
  mid: [110000, 155000],
  senior: [155000, 215000],
  staff: [200000, 280000],
  principal: [240000, 340000],
  director: [280000, 400000],
}

function getMockOutput(
  ctx: AgentContext,
  resumeFindings: ResumeOutput | null
): CompensationOutput {
  const level = ctx.job.level.toLowerCase()
  const [baseMin, baseMax] = LEVEL_BASE[level] ||
    LEVEL_BASE.senior

  const locationMultiplier =
    ctx.job.location.toLowerCase().includes("sf") ||
    ctx.job.location.toLowerCase().includes("san francisco") ||
    ctx.job.location.toLowerCase().includes("new york") ||
    ctx.job.location.toLowerCase().includes("nyc")
      ? 1.2
      : ctx.job.location.toLowerCase().includes("remote")
      ? 1.05
      : 1.0

  const yearsBonus = Math.min(
    (resumeFindings?.yearsExperience || 5) * 0.02,
    0.15
  )
  const multiplier = locationMultiplier + yearsBonus

  return {
    minSalary: Math.round((baseMin * multiplier) / 5000) * 5000,
    maxSalary: Math.round((baseMax * multiplier) / 5000) * 5000,
    confidence: 0.82,
    marketRate: "at market",
    factors: [
      `${ctx.job.level} level in ${ctx.job.department}`,
      `Location: ${ctx.job.location}`,
      resumeFindings
        ? `${resumeFindings.yearsExperience} years experience`
        : "Experience level considered",
      "Current tech market conditions Q1 2026",
    ],
  }
}

export async function runCompensationAgent(
  ctx: AgentContext
): Promise<CompensationOutput> {
  // Read all Band messages to get experience context
  const messages = await band.fetchMessages(ctx.bandRoomId, ctx.bandThreadId)
  const resumeMessage = messages.find((m) => m.agentType === "resume_analyst")
  const resumeFindings = resumeMessage?.metadata?.output as ResumeOutput | null

  const bandContext = messages
    .map((m) => `[${m.agentType}]: ${m.content.slice(0, 300)}...`)
    .join("\n\n")

  let output: CompensationOutput

  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 600))
    output = getMockOutput(ctx, resumeFindings)
  } else {
    const raw = await callAI(SYSTEM_PROMPT, buildPrompt(ctx, bandContext))
    output = extractJSON<CompensationOutput>(raw)
  }

  const formatSalary = (n: number) =>
    `$${(n / 1000).toFixed(0)}K`

  const messageContent = `**Compensation Estimate for ${ctx.candidate.name}**

*Analyzed ${messages.length} Band messages to calibrate experience level.*

**Salary Range: ${formatSalary(output.minSalary)} – ${formatSalary(output.maxSalary)}**
**Market Position:** ${output.marketRate}
**Confidence:** ${(output.confidence * 100).toFixed(0)}%

**Factors Considered:**
${output.factors.map((f) => `• ${f}`).join("\n")}

*Compensation Agent complete. Ranking Agent now has all data needed for final decision.*`

  await band.postMessage(
    ctx.bandRoomId,
    ctx.bandThreadId,
    "compensation_agent",
    messageContent,
    { output, candidateId: ctx.candidateId }
  )

  return output
}
