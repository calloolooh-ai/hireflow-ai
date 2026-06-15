"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import {
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Cpu,
  Activity,
  Database,
  Loader2,
  Gavel,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"

interface Stats {
  activeJobs: number
  totalCandidates: number
  evaluationsCompleted: number
  hiresRecommended: number
}

interface Activity {
  id: string
  action: string
  entityType: string
  actorType: string
  actorId: string | null
  createdAt: string
}

interface CandidateSummary {
  compositeScore: number | null
  technicalScore: number | null
  cultureScore: number | null
  strengths: string[]
  weaknesses: string[]
  rankingReasoning: string | null
  cultureReasoning: string | null
}

interface PendingApproval {
  candidateId: string
  candidateName: string
  jobTitle: string
  decision: "HIRE" | "HOLD" | "REJECT"
  summary: CandidateSummary
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    activeJobs: 0,
    totalCandidates: 0,
    evaluationsCompleted: 0,
    hiresRecommended: 0,
  })
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [hasJobs, setHasJobs] = useState<boolean>(true)
  const [seeding, setSeeding] = useState(false)
  const [pending, setPending] = useState<PendingApproval[]>([])
  const [actioning, setActioning] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/audit?limit=8").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
      fetch("/api/decisions?pendingApproval=true").then((r) => r.json()),
    ]).then(([analyticsData, auditData, jobsData, pendingData]) => {
      setStats({
        activeJobs: analyticsData.activeJobs ?? 0,
        totalCandidates: analyticsData.totalCandidates ?? 0,
        evaluationsCompleted: analyticsData.evaluationsCompleted ?? 0,
        hiresRecommended: analyticsData.hiresRecommended ?? 0,
      })
      setRecentActivity(auditData.logs ?? [])
      setHasJobs((jobsData.jobs ?? []).length > 0)
      setPending(pendingData.pending ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleLoadDemo = async () => {
    if (seeding) return
    setSeeding(true)
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" })
      const data = await res.json()
      if (data.jobId) {
        router.push(`/dashboard/jobs/${data.jobId}`)
      } else {
        setSeeding(false)
      }
    } catch {
      setSeeding(false)
    }
  }

  const handleApproval = async (candidateId: string, action: "approve" | "review" | "reject") => {
    setActioning(candidateId)
    try {
      const res = await fetch("/api/decisions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, action }),
      })
      if (res.ok) {
        setPending((prev) => prev.filter((p) => p.candidateId !== candidateId))
      }
    } finally {
      setActioning(null)
    }
  }

  const DECISION_COLORS: Record<string, string> = {
    HIRE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    HOLD: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    REJECT: "text-red-400 bg-red-500/10 border-red-500/30",
  }

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: Briefcase,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      href: "/dashboard/jobs",
    },
    {
      label: "Total Candidates",
      value: stats.totalCandidates,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      href: "/dashboard/jobs",
    },
    {
      label: "Evaluations Done",
      value: stats.evaluationsCompleted,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      href: "/dashboard/analytics",
    },
    {
      label: "Hires Recommended",
      value: stats.hiresRecommended,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      href: "/dashboard/analytics",
    },
  ]

  const formatAction = (log: Activity) => {
    const actor = log.actorType === "agent"
      ? `Agent: ${log.actorId?.replace(/_/g, " ")}`
      : "Human"
    return `${actor} — ${log.action.replace(/_/g, " ")}`
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div>
      <Navbar
        title="Dashboard"
        subtitle="HireFlow AI — Band-native hiring intelligence"
      />
      <div className="p-6 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/10 border border-blue-500/20 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                Multi-Agent Hiring War Room
              </h2>
              <p className="text-sm text-slate-400 max-w-lg">
                AI agents collaborate through Band to evaluate candidates — each
                agent reads prior findings before posting its own analysis. Every
                decision is transparent and auditable.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {!loading && !hasJobs && (
                <button
                  onClick={handleLoadDemo}
                  disabled={seeding}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                >
                  {seeding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5" />
                  )}
                  {seeding ? "Loading..." : "Load Demo Data"}
                </button>
              )}
              <Link
                href="/dashboard/jobs/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                New Job
              </Link>
            </div>
          </div>

          {/* Agent flow preview */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { label: "Resume Analyst", color: "bg-blue-500/20 border-blue-500/30 text-blue-300" },
              { label: "Technical Eval", color: "bg-purple-500/20 border-purple-500/30 text-purple-300" },
              { label: "Culture Eval", color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" },
              { label: "Compensation", color: "bg-amber-500/20 border-amber-500/30 text-amber-300" },
              { label: "Ranking Agent", color: "bg-orange-500/20 border-orange-500/30 text-orange-300" },
            ].map((agent, i) => (
              <div key={agent.label} className="flex items-center gap-2 shrink-0">
                <div className={`px-3 py-1 rounded-md border text-xs font-medium ${agent.color}`}>
                  {agent.label}
                </div>
                {i < 4 && (
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-px bg-slate-600" />
                    <div className="text-[10px] text-slate-500 bg-[#0f172a] px-1 py-0.5 rounded border border-[#1e293b]">
                      Band
                    </div>
                    <div className="w-6 h-px bg-slate-600" />
                    <ArrowUpRight className="w-3 h-3 text-slate-500 rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link
              key={label}
              href={href}
              className="block bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:border-[#334155] transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">
                {loading ? (
                  <div className="h-7 w-8 bg-[#1e293b] rounded animate-pulse" />
                ) : (
                  value
                )}
              </div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </Link>
          ))}
        </div>

        {/* Awaiting Your Decision */}
        {pending.length > 0 && (
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
            <div className="px-5 py-4 border-b border-[#1e293b] flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Awaiting Your Decision</h3>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                {pending.length}
              </span>
            </div>
            <div className="divide-y divide-[#1e293b]">
              {pending.slice(0, 3).map((p) => {
                const isExpanded = expandedCard === p.candidateId
                const hasSummary = p.summary && (
                  p.summary.strengths.length > 0 ||
                  p.summary.weaknesses.length > 0 ||
                  p.summary.rankingReasoning ||
                  p.summary.compositeScore != null
                )
                return (
                  <div key={p.candidateId} className="divide-y divide-[#1e293b]">
                    {/* Card header row */}
                    <div className="px-5 py-4 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.candidateName}</p>
                        <p className="text-xs text-slate-500 truncate">{p.jobTitle}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-bold ${
                          DECISION_COLORS[p.decision] || "text-slate-400 bg-slate-500/10 border-slate-500/30"
                        }`}
                      >
                        AI: {p.decision}
                      </span>
                      {hasSummary && (
                        <button
                          onClick={() => setExpandedCard(isExpanded ? null : p.candidateId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {isExpanded ? (
                            <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
                          ) : (
                            <><ChevronDown className="w-3.5 h-3.5" /> Quick View</>
                          )}
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproval(p.candidateId, "approve")}
                          disabled={actioning === p.candidateId}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(p.candidateId, "review")}
                          disabled={actioning === p.candidateId}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-60"
                        >
                          Hold
                        </button>
                        <button
                          onClick={() => handleApproval(p.candidateId, "reject")}
                          disabled={actioning === p.candidateId}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Collapsible summary panel */}
                    {isExpanded && hasSummary && (
                      <div className="px-5 py-4 bg-[#0f172a]/60 space-y-4">
                        {/* Scores row */}
                        {(p.summary.compositeScore != null || p.summary.technicalScore != null || p.summary.cultureScore != null) && (
                          <div className="flex items-center gap-4 flex-wrap">
                            {p.summary.compositeScore != null && (
                              <div className="flex flex-col items-center bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2">
                                <span className="text-lg font-bold text-white">{p.summary.compositeScore.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Composite</span>
                              </div>
                            )}
                            {p.summary.technicalScore != null && (
                              <div className="flex flex-col items-center bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2">
                                <span className="text-lg font-bold text-purple-400">{p.summary.technicalScore.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Technical</span>
                              </div>
                            )}
                            {p.summary.cultureScore != null && (
                              <div className="flex flex-col items-center bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-2">
                                <span className="text-lg font-bold text-emerald-400">{p.summary.cultureScore.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Culture</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Strengths + Weaknesses */}
                        {(p.summary.strengths.length > 0 || p.summary.weaknesses.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {p.summary.strengths.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Strengths</p>
                                <ul className="space-y-1">
                                  {p.summary.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                                      <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {p.summary.weaknesses.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">Weaknesses</p>
                                <ul className="space-y-1">
                                  {p.summary.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                                      <span className="text-red-500 mt-0.5 shrink-0">−</span>
                                      <span>{w}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Ranking agent reasoning */}
                        {p.summary.rankingReasoning && (
                          <div>
                            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Agent Reasoning</p>
                            <p className="text-xs text-slate-400 leading-relaxed">{p.summary.rankingReasoning}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            </div>
            <Link
              href="/dashboard/analytics"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-[#1e293b]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#1e293b] rounded animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-[#1e293b] rounded w-3/4 animate-pulse" />
                    <div className="h-2.5 bg-[#1e293b] rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No activity yet. Create a job and run evaluations to see activity here.
              </div>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    log.actorType === "agent"
                      ? "bg-blue-500/20"
                      : "bg-emerald-500/20"
                  }`}>
                    {log.actorType === "agent" ? (
                      <Cpu className="w-3 h-3 text-blue-400" />
                    ) : (
                      <Users className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">
                      {formatAction(log)}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {log.entityType} · {formatTime(log.createdAt)}
                    </p>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
