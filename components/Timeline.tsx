"use client"

import { Cpu, User, CheckCircle, Clock } from "lucide-react"

interface TimelineEvent {
  id: string
  action: string
  actorType: "agent" | "human"
  actorId: string | null
  entityType: string
  entityId: string
  data?: string | null
  createdAt: string | Date
}

interface Props {
  events: TimelineEvent[]
}

const ACTION_LABELS: Record<string, string> = {
  resume_analyst_complete: "Resume Analysis Complete",
  technical_evaluator_complete: "Technical Evaluation Complete",
  culture_evaluator_complete: "Culture Evaluation Complete",
  compensation_agent_complete: "Compensation Estimate Complete",
  ranking_agent_complete: "Final Ranking Complete",
  human_approve: "Hiring Manager Approved",
  human_reject: "Hiring Manager Rejected",
  human_review: "Sent for Further Review",
}

const ACTION_COLORS: Record<string, string> = {
  resume_analyst_complete: "bg-blue-500 text-white",
  technical_evaluator_complete: "bg-purple-500 text-white",
  culture_evaluator_complete: "bg-emerald-500 text-white",
  compensation_agent_complete: "bg-amber-500 text-white",
  ranking_agent_complete: "bg-orange-500 text-white",
  human_approve: "bg-emerald-600 text-white",
  human_reject: "bg-red-600 text-white",
  human_review: "bg-amber-600 text-white",
}

export default function Timeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-slate-500">
        No audit events yet. Run evaluations to populate the timeline.
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-[#1e293b]" />

      <div className="space-y-4">
        {events.map((event, i) => {
          const isAgent = event.actorType === "agent"
          const label = ACTION_LABELS[event.action] || event.action.replace(/_/g, " ")
          const dotColor = ACTION_COLORS[event.action] || (isAgent ? "bg-blue-500 text-white" : "bg-emerald-500 text-white")
          const time = new Date(event.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
          const date = new Date(event.createdAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })

          let parsedData: Record<string, unknown> | null = null
          try {
            parsedData = event.data ? JSON.parse(event.data) : null
          } catch {
            parsedData = null
          }

          return (
            <div key={event.id} className="relative flex items-start gap-4 pl-12">
              {/* Dot */}
              <div
                className={`absolute left-3 w-4 h-4 rounded-full flex items-center justify-center ${dotColor} ring-2 ring-[#0f172a] z-10`}
              >
                {isAgent ? (
                  <Cpu className="w-2 h-2" />
                ) : (
                  <User className="w-2 h-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{label}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
                    <Clock className="w-3 h-3" />
                    {date} {time}
                  </div>
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span>{isAgent ? "AI Agent" : "Human"}</span>
                  {event.actorId && (
                    <>
                      <span>·</span>
                      <span className="capitalize">
                        {event.actorId.replace(/_/g, " ")}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span className="capitalize">{event.entityType}</span>
                </div>

                {parsedData && typeof parsedData.score === "number" && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-slate-400">
                      Score:{" "}
                      <span className={`font-semibold ${
                        (parsedData.score as number) >= 8 ? "text-emerald-400" :
                        (parsedData.score as number) >= 6.5 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {(parsedData.score as number).toFixed(1)}/10
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
