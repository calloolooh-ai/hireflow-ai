import { callAI, extractJSON, isDemoMode } from "@/lib/ai/client"
import * as band from "@/lib/band"
import type {
  AgentContext,
  RankingOutput,
  TechnicalOutput,
  CultureOutput,
  CompensationOutput,
} from "@/lib/types"

const SYSTEM_PROMPT = `You are the Ranking Agent — the final decision maker in a multi-agent hiring system.
You synthesize findings from all prior agents posted to the Band thread.
Your job is to produce a transparent, evidence-based hiring recommendation.
Never make a decision without referencing the specific agent findings from Band.
Always respond with valid JSON matching the specified schema.`

function buildPrompt(ctx: AgentContext, bandContext: string): string {
  return `Make a final hiring recommendation for: ${ctx.candidate.name}
Position: ${ctx.job.title} (${ctx.job.level})

COMPLETE BAND THREAD — All agent findings:
${bandContext}

Synthesize all agent findings and return JSON:
{
  "compositeScore": <1-10 weighted average>,
  "decision": "HIRE" | "HOLD" | "REJECT",
  "reasoning": "evidence-based reasoning referencing specific agent findings",
  "confidence": <0-1 float>,
  "technicalWeight": <0-1, weight given to technical score>,
  "cultureWeight": <0-1, weight given to culture score>,
  "highlights": ["key positive signals"],
  "concerns": ["key concerns or gaps"]
}`
}

function getMockOutput(
  tech: TechnicalOutput | null,
  culture: CultureOutput | null,
  comp: CompensationOutput | null,
  candidateName: string
): RankingOutput {
  const techScore = tech?.score ?? 7.5
  const cultureScore = culture?.score ?? 7.5

  const debateMode = Math.abs(techScore - cultureScore) >= 2.0
  const debateReason = debateMode
    ? `Conflict detected: tech score (${techScore.toFixed(1)}) vs culture score (${cultureScore.toFixed(1)}) — agents debating resolution...`
    : null

  const techWeight = debateMode ? 0.6 : 0.55
  const cultureWeight = debateMode ? 0.4 : 0.45
  const composite = techScore * techWeight + cultureScore * cultureWeight

  let decision: "HIRE" | "HOLD" | "REJECT"
  if (composite >= 8.0) decision = "HIRE"
  else if (composite >= 6.5) decision = "HOLD"
  else decision = "REJECT"

  const compStr = comp
    ? `$${(comp.minSalary / 1000).toFixed(0)}K–$${(comp.maxSalary / 1000).toFixed(0)}K`
    : "market rate"

  const debateStr = debateMode
    ? ` ${debateReason} Resolved score: ${composite.toFixed(1)}/10.`
    : ""

  return {
    compositeScore: parseFloat(composite.toFixed(1)),
    decision,
    reasoning: `After reading all agent findings from the Band thread: Technical Evaluator scored ${techScore.toFixed(1)}/10 with ${
      tech?.strengths?.[0] || "strong skills"
    }. Culture Evaluator scored ${cultureScore.toFixed(1)}/10 citing ${
      culture?.rationale?.slice(0, 80) || "good collaborative indicators"
    }. Compensation estimate of ${compStr} is within budget.${debateStr} ${
      decision === "HIRE"
        ? "All signals point to a strong hire."
        : decision === "HOLD"
        ? "Recommend further assessment before committing."
        : "Gaps too significant to proceed at this time."
    }`,
    confidence: decision === "HIRE" ? 0.87 : decision === "HOLD" ? 0.72 : 0.81,
    technicalWeight: techWeight,
    cultureWeight: cultureWeight,
    highlights: [
      ...(debateMode ? [`⚡ Debate Mode: ${debateReason}`] : []),
      tech?.strengths?.[0] || "Strong technical background",
      `Composite score ${composite.toFixed(1)}/10`,
      `Culture fit: ${cultureScore.toFixed(1)}/10`,
    ],
    concerns:
      tech?.gaps?.slice(0, 2) || ["Minor skill gaps identified"],
  }
}

export async function runRankingAgent(
  ctx: AgentContext
): Promise<RankingOutput> {
  // Read the COMPLETE Band thread — all prior agent findings
  const messages = await band.fetchMessages(ctx.bandRoomId, ctx.bandThreadId)

  const techMessage = messages.find((m) => m.agentType === "technical_evaluator")
  const cultureMessage = messages.find((m) => m.agentType === "culture_evaluator")
  const compMessage = messages.find((m) => m.agentType === "compensation_agent")

  const techOutput = techMessage?.metadata?.output as TechnicalOutput | null
  const cultureOutput = cultureMessage?.metadata?.output as CultureOutput | null
  const compOutput = compMessage?.metadata?.output as CompensationOutput | null

  let output: RankingOutput

  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 1000))
    output = getMockOutput(techOutput, cultureOutput, compOutput, ctx.candidate.name)
  } else {
    const bandContext = messages
      .map((m) => `\n=== ${m.agentType.toUpperCase()} ===\n${m.content}`)
      .join("\n")
    const raw = await callAI(SYSTEM_PROMPT, buildPrompt(ctx, bandContext))
    output = extractJSON<RankingOutput>(raw)
  }

  const decisionEmoji =
    output.decision === "HIRE" ? "✅" : output.decision === "HOLD" ? "⏸️" : "❌"

  const debateBlock = (output.highlights?.[0] as string | undefined)?.startsWith("⚡ Debate Mode")
    ? `\n**⚡ Debate Mode Triggered**\n${output.highlights[0].replace("⚡ Debate Mode: ", "")}\n`
    : ""

  const messageContent = `${debateBlock}**FINAL HIRING RECOMMENDATION: ${decisionEmoji} ${output.decision}**
**Candidate:** ${ctx.candidate.name}
**Composite Score:** ${output.compositeScore}/10 (Confidence: ${(output.confidence * 100).toFixed(0)}%)

*Synthesized findings from ${messages.length} agent messages in this Band thread.*

**Scoring Weights:** Technical ${(output.technicalWeight * 100).toFixed(0)}% | Culture ${(output.cultureWeight * 100).toFixed(0)}%

**Evidence-Based Reasoning:**
${output.reasoning}

**Key Highlights:**
${output.highlights.map((h) => `✓ ${h}`).join("\n")}

**Concerns:**
${output.concerns.length ? output.concerns.map((c) => `⚠ ${c}`).join("\n") : "• None significant"}

---
*Decision requires human approval before taking effect. Awaiting hiring manager review.*`

  await band.postMessage(
    ctx.bandRoomId,
    ctx.bandThreadId,
    "ranking_agent",
    messageContent,
    { output, candidateId: ctx.candidateId }
  )

  return output
}
