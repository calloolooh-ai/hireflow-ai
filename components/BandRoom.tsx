"use client"

import { Cpu, MessageSquare, Clock, ArrowDown } from "lucide-react"

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
}> = {
  resume_analyst: {
    label: "Resume Analyst",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  technical_evaluator: {
    label: "Technical Evaluator",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    dot: "bg-purple-400",
  },
  culture_evaluator: {
    label: "Culture Evaluator",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  compensation_agent: {
    label: "Compensation Agent",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  ranking_agent: {
    label: "Ranking Agent",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    dot: "bg-orange-400",
  },
}

interface Props {
  messages: BandMsg[]
  roomId?: string
  threadTitle?: string
}

export default function BandRoom({ messages, roomId, threadTitle }: Props) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-slate-500">
        No Band messages yet. Run an evaluation to see agent collaboration here.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Room header */}
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
        <span className="text-[10px] text-slate-600 font-medium">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      {messages.map((msg, i) => {
        const config = AGENT_CONFIG[msg.agentType] || {
          label: msg.agentType,
          color: "text-slate-400",
          bg: "bg-slate-500/10",
          border: "border-slate-500/20",
          dot: "bg-slate-400",
        }

        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })

        const lines = msg.content.split("\n")

        return (
          <div key={msg.id} className="band-message">
            <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
              {/* Agent header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}>
                    <Cpu className={`w-3 h-3 ${config.color}`} />
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
