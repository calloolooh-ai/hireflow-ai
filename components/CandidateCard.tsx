"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Code2,
  Heart,
  DollarSign,
  Trophy,
  ExternalLink,
  Info,
} from "lucide-react"

interface Evaluation {
  agentType: string
  output: string
  score: number | null
}

interface Decision {
  decision: "HIRE" | "HOLD" | "REJECT"
  reasoning: string
  compositeScore: number
  confidence: number
  humanDecision?: string | null
}

interface CandidateCardProps {
  id: string
  name: string
  email: string
  status: string
  evaluations: Evaluation[]
  decision?: Decision
  onApprove?: (id: string, action: "approve" | "reject" | "review") => void
}

const DECISION_COLORS = {
  HIRE: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: CheckCircle,
  },
  HOLD: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: Clock,
  },
  REJECT: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: XCircle,
  },
}

function ScoreChip({ score, label, icon: Icon, color }: {
  score: number | null
  label: string
  icon: React.ElementType
  color: string
}) {
  if (score === null) return null
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-xs text-slate-500">{label}:</span>
      <span className={`text-xs font-semibold ${
        score >= 8 ? "text-emerald-400" :
        score >= 6.5 ? "text-amber-400" : "text-red-400"
      }`}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

export default function CandidateCard({
  id,
  name,
  email,
  evaluations,
  decision,
  onApprove,
}: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeEval, setActiveEval] = useState<string | null>(null)

  const techEval = evaluations.find((e) => e.agentType === "technical_evaluator")
  const cultureEval = evaluations.find((e) => e.agentType === "culture_evaluator")
  const compEval = evaluations.find((e) => e.agentType === "compensation_agent")
  const resumeEval = evaluations.find((e) => e.agentType === "resume_analyst")

  const safeParse = (s: string | undefined | null) => { try { return s ? JSON.parse(s) : null } catch { return null } }
  const techOutput = techEval ? safeParse(techEval.output) : null
  const cultureOutput = cultureEval ? safeParse(cultureEval.output) : null
  const compOutput = compEval ? safeParse(compEval.output) : null
  const resumeOutput = resumeEval ? safeParse(resumeEval.output) : null

  const decisionStyle = decision ? DECISION_COLORS[decision.decision] : null
  const DecisionIcon = decisionStyle?.icon

  return (
    <div className={`bg-[#111827] border rounded-xl overflow-hidden transition-colors ${
      decisionStyle
        ? `${decisionStyle.border}`
        : "border-[#1e293b]"
    }`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-sm font-bold text-slate-300 shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="text-xs text-slate-500">{email}</div>
            </div>
          </div>

          {decision && DecisionIcon && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${decisionStyle.bg} ${decisionStyle.border}`}>
              <DecisionIcon className={`w-3.5 h-3.5 ${decisionStyle.text}`} />
              <span className={`text-xs font-bold ${decisionStyle.text}`}>
                {decision.decision}
              </span>
            </div>
          )}
        </div>

        {/* Score row */}
        {(techEval || cultureEval) && (
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <ScoreChip
              score={techEval?.score ?? null}
              label="Tech"
              icon={Code2}
              color="text-purple-400"
            />
            <ScoreChip
              score={cultureEval?.score ?? null}
              label="Culture"
              icon={Heart}
              color="text-emerald-400"
            />
            {decision && (
              <ScoreChip
                score={decision.compositeScore}
                label="Overall"
                icon={Trophy}
                color="text-amber-400"
              />
            )}
            {compOutput && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-slate-500">Est:</span>
                <span className="text-xs font-semibold text-amber-400">
                  ${Math.round(compOutput.minSalary / 1000)}K–${Math.round(compOutput.maxSalary / 1000)}K
                </span>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {resumeOutput?.skills && (
          <div className="mt-3 flex flex-wrap gap-1">
            {resumeOutput.skills.slice(0, 5).map((skill: string) => (
              <span
                key={skill}
                className="px-1.5 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[10px] text-slate-400"
              >
                {skill}
              </span>
            ))}
            {resumeOutput.skills.length > 5 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-600">
                +{resumeOutput.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expand toggle */}
      {evaluations.length > 0 && (
        <div className="border-t border-[#1e293b]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-[#1a2235] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              {evaluations.length} agent evaluation{evaluations.length !== 1 ? "s" : ""}
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#1e293b] p-4 space-y-3">
          {/* Eval tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {evaluations.map((e) => (
              <button
                key={e.agentType}
                onClick={() =>
                  setActiveEval(activeEval === e.agentType ? null : e.agentType)
                }
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeEval === e.agentType
                    ? "bg-blue-600 text-white"
                    : "bg-[#1e293b] text-slate-400 hover:text-slate-200"
                }`}
              >
                {e.agentType.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Active eval output */}
          {activeEval && (
            <div className="p-3 rounded-lg bg-[#0f172a] border border-[#1e293b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  {activeEval.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">
                  Raw JSON
                </span>
              </div>
              <pre className="text-[10px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                {JSON.stringify(safeParse(evaluations.find((e) => e.agentType === activeEval)?.output) ?? {}, null, 2)}
              </pre>
            </div>
          )}

          {/* Decision reasoning */}
          {decision && (
            <div className={`p-3 rounded-lg border ${decisionStyle?.bg} ${decisionStyle?.border}`}>
              <div className="text-xs font-semibold text-slate-300 mb-1.5">
                Ranking Agent Reasoning
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {decision.reasoning}
              </p>
              {decision.confidence && (
                <div className="mt-2 text-[10px] text-slate-600">
                  Confidence: {(decision.confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          )}

          {/* Human approval */}
          {decision && !decision.humanDecision && onApprove && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 mr-1">Human review:</span>
              <button
                onClick={() => onApprove(id, "approve")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-md transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => onApprove(id, "review")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-md transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Request Review
              </button>
              <button
                onClick={() => onApprove(id, "reject")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-md transition-colors"
              >
                <XCircle className="w-3 h-3" />
                Reject
              </button>
            </div>
          )}

          {decision?.humanDecision && (
            <div className="text-xs text-slate-500 pt-1">
              Human decision: <span className="text-slate-300 font-medium capitalize">{decision.humanDecision}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
