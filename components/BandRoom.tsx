"use client"

import { useState } from "react"
import {
  MessageSquare,
  Clock,
  ArrowDown,
  FileText,
  Code2,
  Heart,
  DollarSign,
  Trophy,
  Cpu,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react"

interface BandMsg {
  id: string
  agentType: string
  content: string
  metadata?: Record<string, unknown>
  createdAt: string | Date
}

const AGENT_CONFIG: Record<string, {
  label: string
  color: string
  bg: string
  border: string
  dot: string
  icon: React.ElementType
}> = {
  resume_analyst: {
    label: "Resume Analyst",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    icon: FileText,
  },
  technical_evaluator: {
    label: "Technical Evaluator",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    dot: "bg-purple-400",
    icon: Code2,
  },
  culture_evaluator: {
    label: "Culture Evaluator",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: Heart,
  },
  compensation_agent: {
    label: "Compensation Agent",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    icon: DollarSign,
  },
  ranking_agent: {
    label: "Ranking Agent",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    dot: "bg-orange-400",
    icon: Trophy,
  },
}

function safeParseMeta(meta: unknown): Record<string, unknown> | null {
  if (!meta) return null
  if (typeof meta === "object") return meta as Record<string, unknown>
  if (typeof meta === "string") {
    try {
      return JSON.parse(meta)
    } catch {
      return null
    }
  }
  return null
}

function Chips({ items }: { items: unknown }) {
  if (!Array.isArray(items)) return null
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((it, i) => (
        <span
          key={i}
          className="px-1.5 py-0.5 rounded bg-[#1e293b] border border-[#334155] text-[10px] text-slate-400"
        >
          {String(it)}
        </span>
      ))}
    </div>
  )
}

function BulletList({ items }: { items: unknown }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <ul className="space-y-0.5">
      {items.map((it, i) => (
        <li key={i} className="text-[11px] text-slate-300 pl-2">
          • {String(it)}
        </li>
      ))}
    </ul>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-slate-600">{label}</span>
      <div className="text-slate-300 mt-0.5">{value}</div>
    </div>
  )
}

function EvidencePanel({ agentType, output }: { agentType: string; output: Record<string, unknown> }) {
  const num = (k: string) =>
    typeof output[k] === "number" ? (output[k] as number) : null

  switch (agentType) {
    case "resume_analyst":
      return (
        <div className="space-y-2">
          <Field label="Years Experience" value={num("yearsExperience")} />
          <Field label="Skills" value={<Chips items={output.skills} />} />
          <Field label="Summary" value={String(output.summary ?? "")} />
        </div>
      )
    case "technical_evaluator":
      return (
        <div className="space-y-2">
          <Field label="Score" value={num("score")} />
          <Field label="Strengths" value={<BulletList items={output.strengths} />} />
          <Field label="Weaknesses" value={<BulletList items={output.weaknesses} />} />
          <Field label="Rationale" value={String(output.rationale ?? "")} />
        </div>
      )
    case "culture_evaluator":
      return (
        <div className="space-y-2">
          <Field label="Score" value={num("score")} />
          <Field label="Reasoning" value={String(output.reasoning ?? "")} />
          <Field label="Concerns" value={<BulletList items={output.concerns} />} />
        </div>
      )
    case "compensation_agent":
      return (
        <div className="space-y-2">
          <Field
            label="Salary Range"
            value={
              typeof output.minSalary === "number" && typeof output.maxSalary === "number"
                ? `$${Math.round((output.minSalary as number) / 1000)}K – $${Math.round((output.maxSalary as number) / 1000)}K`
                : null
            }
          />
          <Field
            label="Confidence"
            value={
              typeof output.confidence === "number"
                ? `${Math.round((output.confidence as number) * 100)}%`
                : null
            }
          />
        </div>
      )
    case "ranking_agent": {
      const decision = output.decision ? String(output.decision) : null
      const decColor =
        decision === "HIRE"
          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
          : decision === "HOLD"
          ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
          : "bg-red-500/15 border-red-500/40 text-red-400"
      return (
        <div className="space-y-2">
          {decision && (
            <div className={`inline-block px-3 py-1.5 rounded-lg border text-sm font-bold ${decColor}`}>
              {decision}
            </div>
          )}
          <Field
            label="Composite Score"
            value={num("compositeScore") ?? num("composite") ?? num("score")}
          />
          <Field label="Highlights" value={<BulletList items={output.highlights} />} />
        </div>
      )
    }
    default:
      return (
        <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap break-words">
          {JSON.stringify(output, null, 2)}
        </pre>
      )
  }
}

interface Props {
  messages: BandMsg[]
  roomId?: string
  threadTitle?: string
  bandMode?: "live" | "mock"
  jobId?: string
}

export default function BandRoom({ messages, roomId, threadTitle, bandMode, jobId }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {/* Room header — always shown */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0f172a] rounded-lg border border-[#1e293b]">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-indigo-400">
            # {roomId || "band-room"}
          </div>
          {threadTitle && (
            <div className="text-[10px] text-slate-500 truncate">
              Thread: {threadTitle}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-600 font-medium mr-2">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
        {bandMode === "live" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400">Live Band</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[10px] font-semibold text-indigo-400">Simulated</span>
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-400">No agent messages yet</p>
          <p className="text-xs text-slate-600">Run an evaluation on the job page to see agents collaborate here in real time.</p>
          {jobId && (
            <a
              href={`/dashboard/jobs/${jobId}`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
            >
              ← Run evaluation
            </a>
          )}
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => {
        const config = AGENT_CONFIG[msg.agentType] || {
          label: msg.agentType,
          color: "text-slate-400",
          bg: "bg-slate-500/10",
          border: "border-slate-500/20",
          dot: "bg-slate-400",
          icon: Cpu,
        }
        const AgentIcon = config.icon

        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })

        const lines = msg.content.split("\n")

        const meta = safeParseMeta(msg.metadata)
        const metaOutput = safeParseMeta(meta?.output ?? meta)
        const isExpanded = expandedId === msg.id

        // Conflict detection (Feature 3)
        const isConflict =
          msg.agentType === "ranking_agent" &&
          (msg.content.includes("⚡ Debate Mode") ||
            msg.content.includes("CONFLICT DETECTED") ||
            Boolean(meta && meta.debateMode))
        let conflictScores: { tech?: number; culture?: number } = {}
        if (isConflict) {
          const src = (metaOutput ?? meta ?? {}) as Record<string, unknown>
          if (typeof src.technicalScore === "number") conflictScores.tech = src.technicalScore
          if (typeof src.cultureScore === "number") conflictScores.culture = src.cultureScore
        }

        return (
          <div key={msg.id} className="band-message">
            <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
              {/* Agent header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}>
                    <AgentIcon className={`w-3 h-3 ${config.color}`} />
                  </div>
                  <span className={`text-xs font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-slate-600 px-1.5 py-0.5 bg-[#0f172a] rounded border border-[#1e293b]">
                    Agent
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Clock className="w-3 h-3" />
                  {time}
                </div>
              </div>

              {/* Conflict resolved banner (Feature 3) */}
              {isConflict && (
                <div className="mb-3 rounded-lg bg-gradient-to-r from-red-500/20 to-emerald-500/20 border border-amber-500/30 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    ⚡ CONFLICT RESOLVED
                  </div>
                  {(conflictScores.tech !== undefined || conflictScores.culture !== undefined) && (
                    <div className="mt-1.5 flex items-center gap-4 text-[11px]">
                      {conflictScores.tech !== undefined && (
                        <span className="text-purple-400 font-semibold">
                          Technical: {conflictScores.tech.toFixed(1)}
                        </span>
                      )}
                      {conflictScores.culture !== undefined && (
                        <span className="text-emerald-400 font-semibold">
                          Culture: {conflictScores.culture.toFixed(1)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Message content */}
              <div className="space-y-1.5">
                {lines.map((line, j) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={j} className={`text-sm font-semibold ${config.color}`}>
                        {line.replace(/\*\*/g, "")}
                      </p>
                    )
                  }
                  if (line.startsWith("• ") || line.startsWith("✓ ") || line.startsWith("⚠ ")) {
                    return (
                      <p key={j} className="text-xs text-slate-300 pl-2">
                        {line}
                      </p>
                    )
                  }
                  if (line.startsWith("| ")) {
                    return (
                      <p key={j} className="text-xs text-slate-400 font-mono">
                        {line}
                      </p>
                    )
                  }
                  if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
                    return (
                      <p key={j} className="text-[10px] italic text-slate-600 mt-2">
                        {line.replace(/\*/g, "")}
                      </p>
                    )
                  }
                  if (line.startsWith("#")) {
                    return (
                      <p key={j} className="text-[10px] text-slate-600 font-medium uppercase tracking-wider mt-1">
                        {line.replace(/^#+\s/, "")}
                      </p>
                    )
                  }
                  if (line.trim() === "---") {
                    return <hr key={j} className="border-[#1e293b] my-2" />
                  }
                  if (line.trim() === "") {
                    return <div key={j} className="h-1" />
                  }
                  return (
                    <p key={j} className="text-xs text-slate-300">
                      {line}
                    </p>
                  )
                })}
              </div>

              {/* Evidence toggle (Feature 2) */}
              {metaOutput && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className={`flex items-center gap-1 text-[10px] font-medium ${config.color} hover:opacity-80 transition-opacity`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    {isExpanded ? "Hide Evidence" : "View Evidence"}
                  </button>
                  {isExpanded && (
                    <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-3 mt-2 text-xs">
                      <EvidencePanel agentType={msg.agentType} output={metaOutput} />
                    </div>
                  )}
                </div>
              )}

              {/* Band read indicator */}
              {i > 0 && (
                <div className="mt-3 pt-3 border-t border-[#1e293b]/50">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <MessageSquare className="w-3 h-3" />
                    Read {i} prior message{i !== 1 ? "s" : ""} from Band before posting
                  </div>
                </div>
              )}
            </div>

            {/* Connector arrow */}
            {i < messages.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className="flex items-center gap-2">
                  <div className="w-px h-3 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] text-indigo-400 font-semibold">
                  <ArrowDown className="w-2.5 h-2.5" />
                  via Band
                </div>
                <div className="w-px h-3 bg-gradient-to-b from-transparent to-transparent" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
