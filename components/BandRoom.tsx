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
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    dot: "bg-orange-400",
    icon: FileText,
  },
  technical_evaluator: {
    label: "Technical Evaluator",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    dot: "bg-cyan-400",
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
          className="px-1.5 py-0.5 rounded bg-[#1f1f28] border border-[#2a2a36] text-[10px] text-zinc-400"
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
        <li key={i} className="text-[11px] text-zinc-300 pl-2">
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
      <span className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</span>
      <div className="text-zinc-300 mt-0.5">{value}</div>
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
        <pre className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap break-words">
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
      {/* Room header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0c0c0f] rounded-lg border border-[#1f1f28]">
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-orange-400 font-mono">
            # {roomId || "band-room"}
          </div>
          {threadTitle && (
            <div className="text-[10px] text-zinc-500 truncate font-mono">
              Thread: {threadTitle}
            </div>
          )}
        </div>
        <span className="text-[10px] text-zinc-600 font-medium mr-2 font-mono">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
        {bandMode === "live" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400 font-mono">Live Band</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="text-[10px] font-semibold text-orange-400 font-mono">Simulated</span>
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-medium text-zinc-400">No agent messages yet</p>
          <p className="text-xs text-zinc-600">Run an evaluation on the job page to see agents collaborate here in real time.</p>
          {jobId && (
            <a
              href={`/dashboard/jobs/${jobId}`}
              className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors mt-1"
            >
              ← Run evaluation
            </a>
          )}
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => {
        if (msg.agentType === "debate_start") {
          const meta = safeParseMeta(msg.metadata)
          const techScore = typeof meta?.techScore === "number" ? meta.techScore : null
          const cultureScore = typeof meta?.cultureScore === "number" ? meta.cultureScore : null
          return (
            <div key={msg.id}>
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-orange-500/15 to-amber-500/15 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300 uppercase tracking-wide font-mono">
                    ⚡ CONFLICT DETECTED — Ranking Agent mediating
                  </span>
                </div>
                <p className="text-xs text-amber-100/80 mb-3">{msg.content}</p>
                {(techScore !== null || cultureScore !== null) && (
                  <div className="flex items-center gap-3">
                    {techScore !== null && (
                      <div className="flex-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-3 py-2">
                        <div className="text-[10px] text-cyan-300/80 uppercase font-semibold font-mono">Technical</div>
                        <div className="text-lg font-bold text-cyan-300">{techScore.toFixed(1)}</div>
                      </div>
                    )}
                    <span className="text-amber-400 font-bold text-sm">vs</span>
                    {cultureScore !== null && (
                      <div className="flex-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
                        <div className="text-[10px] text-emerald-300/80 uppercase font-semibold font-mono">Culture</div>
                        <div className="text-lg font-bold text-emerald-300">{cultureScore.toFixed(1)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {i < messages.length - 1 && (
                <div className="flex flex-col items-center py-1">
                  <div className="w-px h-3 bg-gradient-to-b from-orange-500/50 to-transparent" />
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-400 font-semibold font-mono">
                    <ArrowDown className="w-2.5 h-2.5" />
                    via Band
                  </div>
                </div>
              )}
            </div>
          )
        }

        const config = AGENT_CONFIG[msg.agentType] || {
          label: msg.agentType,
          color: "text-zinc-400",
          bg: "bg-zinc-500/10",
          border: "border-zinc-500/20",
          dot: "bg-zinc-400",
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

        const BAND_READ_COUNTS: Record<string, number> = {
          resume_analyst: 0,
          technical_evaluator: 1,
          culture_evaluator: 2,
          compensation_agent: 3,
          ranking_agent: 4,
        }
        const bandReadCount = (typeof meta?.band_messages_read === "number" ? meta.band_messages_read : null) ??
          BAND_READ_COUNTS[msg.agentType] ?? 0

        return (
          <div key={msg.id} className="band-message">
            <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
              {/* Agent header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}>
                    <AgentIcon className={`w-3 h-3 ${config.color}`} />
                  </div>
                  <span className={`text-xs font-semibold ${config.color} font-mono`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-[#0c0c0f] rounded border border-[#1f1f28] font-mono">
                    agent
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                  <Clock className="w-3 h-3" />
                  {time}
                </div>
              </div>

              {/* "Read N messages from Band" */}
              {bandReadCount > 0 && (
                <div className="text-[10px] text-orange-400/70 mb-3 flex items-center gap-1.5 italic font-mono">
                  <MessageSquare className="w-3 h-3 shrink-0" />
                  📖 Read {bandReadCount} message{bandReadCount !== 1 ? "s" : ""} from Band before responding
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
                      <p key={j} className="text-xs text-zinc-300 pl-2">
                        {line}
                      </p>
                    )
                  }
                  if (line.startsWith("| ")) {
                    return (
                      <p key={j} className="text-xs text-zinc-400 font-mono">
                        {line}
                      </p>
                    )
                  }
                  if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
                    return (
                      <p key={j} className="text-[10px] italic text-zinc-600 mt-2">
                        {line.replace(/\*/g, "")}
                      </p>
                    )
                  }
                  if (line.startsWith("#")) {
                    return (
                      <p key={j} className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider mt-1 font-mono">
                        {line.replace(/^#+\s/, "")}
                      </p>
                    )
                  }
                  if (line.trim() === "---") {
                    return <hr key={j} className="border-[#1f1f28] my-2" />
                  }
                  if (line.trim() === "") {
                    return <div key={j} className="h-1" />
                  }
                  return (
                    <p key={j} className="text-xs text-zinc-300">
                      {line}
                    </p>
                  )
                })}
              </div>

              {/* Evidence toggle */}
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
                    <div className="bg-[#0c0c0f] border border-[#1f1f28] rounded-lg p-3 mt-2 text-xs">
                      <EvidencePanel agentType={msg.agentType} output={metaOutput} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connector arrow between messages */}
            {i < messages.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className="w-px h-3 bg-gradient-to-b from-orange-500/50 to-transparent" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-400 font-semibold font-mono">
                  <ArrowDown className="w-2.5 h-2.5" />
                  via Band
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
