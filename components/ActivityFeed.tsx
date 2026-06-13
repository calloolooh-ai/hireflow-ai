"use client"

import { useEffect, useRef } from "react"
import {
  Cpu,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  AlertCircle,
  Play,
  Trophy,
  Loader2,
} from "lucide-react"
import type { EvalEvent, AgentType } from "@/lib/types"

const AGENT_COLORS: Record<AgentType, string> = {
  resume_analyst: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  technical_evaluator: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  culture_evaluator: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  compensation_agent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ranking_agent: "text-orange-400 bg-orange-500/10 border-orange-500/20",
}

const AGENT_LABELS: Record<AgentType, string> = {
  resume_analyst: "Resume Analyst",
  technical_evaluator: "Technical Evaluator",
  culture_evaluator: "Culture Evaluator",
  compensation_agent: "Compensation Agent",
  ranking_agent: "Ranking Agent",
}

function EventIcon({ event }: { event: EvalEvent }) {
  const cls = "w-3.5 h-3.5"
  switch (event.type) {
    case "start": return <Play className={`${cls} text-blue-400`} />
    case "agent_start": return <Loader2 className={`${cls} animate-spin text-slate-400`} />
    case "band_read": return <BookOpen className={`${cls} text-sky-400`} />
    case "band_post": return <MessageSquare className={`${cls} text-indigo-400`} />
    case "agent_complete": return <CheckCircle2 className={`${cls} text-emerald-400`} />
    case "complete": return <Trophy className={`${cls} text-amber-400`} />
    case "error": return <AlertCircle className={`${cls} text-red-400`} />
    default: return <Cpu className={`${cls} text-slate-400`} />
  }
}

function DecisionBadge({ decision }: { decision?: string }) {
  if (!decision) return null
  const colors = {
    HIRE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    HOLD: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    REJECT: "text-red-400 bg-red-500/10 border-red-500/30",
  }
  return (
    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded border text-xs font-bold ${
      colors[decision as keyof typeof colors] || ""
    }`}>
      {decision}
    </span>
  )
}

interface Props {
  events: EvalEvent[]
  isRunning: boolean
}

export default function ActivityFeed({ events, isRunning }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [events])

  return (
    <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
      {events.length === 0 && !isRunning && (
        <div className="text-center py-8 text-sm text-slate-500">
          Click &quot;Run Evaluation&quot; to start the multi-agent pipeline
        </div>
      )}

      {events.map((event, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 p-3 rounded-lg border animate-slide-up ${
            event.type === "complete"
              ? "bg-amber-500/5 border-amber-500/20"
              : event.type === "error"
              ? "bg-red-500/5 border-red-500/20"
              : event.type === "band_post" || event.type === "band_read"
              ? "bg-indigo-500/5 border-indigo-500/20"
              : event.type === "agent_complete"
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-[#1a2235] border-[#1e293b]"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            <EventIcon event={event} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {event.agent && (
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    AGENT_COLORS[event.agent] || "text-slate-400 bg-slate-500/10 border-slate-500/20"
                  }`}
                >
                  <Cpu className="w-2.5 h-2.5" />
                  {AGENT_LABELS[event.agent] || event.agent}
                </span>
              )}

              {(event.type === "band_post" || event.type === "band_read") && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                  <MessageSquare className="w-2.5 h-2.5" />
                  Band
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1">{event.message}</p>

            <div className="flex items-center gap-3 mt-1">
              {typeof event.score === "number" && (
                <span className="text-[10px] text-slate-500">
                  Score:{" "}
                  <span className={`font-semibold ${
                    event.score >= 8 ? "text-emerald-400" :
                    event.score >= 6.5 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {event.score.toFixed(1)}/10
                  </span>
                </span>
              )}
              {event.decision && <DecisionBadge decision={event.decision} />}
              <span className="text-[10px] text-slate-600 ml-auto">
                {new Date(event.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      ))}

      {isRunning && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a2235] border border-[#1e293b]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
          <span className="text-xs text-slate-400">Agents collaborating via Band...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
