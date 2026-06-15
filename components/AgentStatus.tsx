"use client"

import {
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Code2,
  Heart,
  DollarSign,
  Trophy,
} from "lucide-react"
import type { AgentType } from "@/lib/types"

const AGENTS: Array<{
  type: AgentType
  label: string
  color: string
  bg: string
  border: string
  icon: React.ElementType
}> = [
  {
    type: "resume_analyst",
    label: "Resume Analyst",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: FileText,
  },
  {
    type: "technical_evaluator",
    label: "Technical Evaluator",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: Code2,
  },
  {
    type: "culture_evaluator",
    label: "Culture Evaluator",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: Heart,
  },
  {
    type: "compensation_agent",
    label: "Compensation Agent",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: DollarSign,
  },
  {
    type: "ranking_agent",
    label: "Ranking Agent",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: Trophy,
  },
]

interface Props {
  completedAgents: AgentType[]
  activeAgent: AgentType | null
}

export default function AgentStatus({ completedAgents, activeAgent }: Props) {
  const progress = Math.round((completedAgents.length / AGENTS.length) * 100)
  return (
    <div className="space-y-2">
    {completedAgents.length > 0 && (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-[#1e293b] rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] text-slate-500 shrink-0">{progress}%</span>
      </div>
    )}
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {AGENTS.map((agent, i) => {
        const isDone = completedAgents.includes(agent.type)
        const isActive = activeAgent === agent.type
        const AgentIcon = agent.icon

        return (
          <div key={agent.type} className="flex items-center gap-1.5 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                isDone
                  ? `${agent.bg} ${agent.border} ${agent.color}`
                  : isActive
                  ? `${agent.bg} ${agent.border} ${agent.color} agent-active`
                  : "bg-[#1a2235] border-[#1e293b] text-slate-600"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : isActive ? (
                <AgentIcon className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              ) : (
                <Clock className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="hidden sm:block">{agent.label}</span>
              <span className="sm:hidden">{agent.label.split(" ")[0]}</span>
            </div>

            {i < AGENTS.length - 1 && (
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="text-[8px] text-indigo-500 font-bold">Band</div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              </div>
            )}
          </div>
        )
      })}
    </div>
    </div>
  )
}
