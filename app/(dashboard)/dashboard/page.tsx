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

interface AuditLog {
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

function toAgentLabel(actorId: string | null): string {
  if (!actorId) return "Agent"
  return actorId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function formatEvalAction(log: AuditLog): string {
  if (log.actorType === "agent") {
    const agent = toAgentLabel(log.actorId)
    const action = log.action.replace(/_/g, " ")
    return `${agent} · ${action}`
  }
  return log.action.replace(/_/g, " ")
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [hasJobs, setHasJobs] = useState<boolean>(true)
  const [seeding, setSeeding] = useState(false)
  const [pending, setPending] = useState<PendingApproval[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  useEffect(() => {
    // Fetch each independently so cards light up as soon as their data arrives
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setStats({
          activeJobs: d.activeJobs ?? 0,
          totalCandidates: d.totalCandidates ?? 0,
          evaluationsCompleted: d.evaluationsCompleted ?? 0,
          hiresRecommended: d.hiresRecommended ?? 0,
        })
      })
      .catch(() => setStats({ activeJobs: 0, totalCandidates: 0, evaluationsCompleted: 0, hiresRecommended: 0 }))
      .finally(() => setAnalyticsLoading(false))

    fetch("/api/audit?limit=8")
      .then((r) => r.json())
      .then((d) => setRecentActivity(d.logs ?? []))
      .catch(() => setRecentActivity([]))
      .finally(() => setActivityLoading(false))

    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setHasJobs((d.jobs ?? []).length > 0))
      .catch(() => {})

    fetch("/api/decisions?pendingApproval=true")
      .then((r) => r.json())
      .then((d) => setPending(d.pending ?? []))
      .catch(() => setPending([]))
      .finally(() => setPendingLoading(false))
  }, [])

  const handleLoadDemo = async () => {
    if (seeding) return
    if (hasJobs && !confirm("Reset demo? This will add fresh demo jobs and candidates.")) return
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
      value: stats?.activeJobs ?? 0,
      icon: Briefcase,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      href: "/dashboard/jobs",
    },
    {
      label: "Total Candidates",
      value: stats?.totalCandidates ?? 0,
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      href: "/dashboard/jobs",
    },
    {
      label: "Evaluations Done",
      value: stats?.evaluationsCompleted ?? 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      href: "/dashboard/jobs",
    },
    {
      label: "Hires Recommended",
      value: stats?.hiresRecommended ?? 0,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      href: "/dashboard/jobs",
    },
  ]

  return (
    <div>
      <Navbar
        title="Dashboard"
        subtitle="HireFlow AI — Band-native hiring intelligence"
      />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Top action bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-white">Overview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              disabled={seeding || analyticsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f28] hover:bg-[#2a2a36] text-zinc-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {seeding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              {seeding ? "Loading..." : hasJobs ? "Reset Demo" : "Load Demo Data"}
            </button>
            <Link
              href="/dashboard/jobs/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              New Job
            </Link>
          </div>
        </div>

        {/* Stats grid — each card lights up independently */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link
              key={label}
              href={href}
              className="block bg-[#141416] border border-[#1f1f28] rounded-xl p-5 hover:border-[#2a2a36] transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">
                {analyticsLoading ? (
                  <div className="h-7 w-10 bg-[#1f1f28] rounded animate-pulse" />
                ) : (
                  value
                )}
              </div>
              <div className="text-xs text-zinc-500 font-medium">{label}</div>
            </Link>
          ))}
        </div>

        {/* Awaiting Your Decision */}
        {!pendingLoading && pending.length > 0 && (
          <div className="bg-[#141416] border border-[#1f1f28] rounded-xl">
            <div className="px-5 py-4 border-b border-[#1f1f28] flex items-center gap-2">
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
                    <div className="px-5 py-4 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.candidateName}</p>
                        <p className="text-xs text-zinc-500 truncate">{p.jobTitle}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-bold ${
                          DECISION_COLORS[p.decision] || "text-zinc-400 bg-zinc-500/10 border-zinc-500/30"
                        }`}
                      >
                        AI: {p.decision}
                      </span>
                      {hasSummary && (
                        <button
                          onClick={() => setExpandedCard(isExpanded ? null : p.candidateId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1f1f28] hover:bg-[#2a2a36] text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          {isExpanded ? (
                            <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
                          ) : (
                            <><ChevronDown className="w-3.5 h-3.5" /> Details</>
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

                    {isExpanded && hasSummary && (
                      <div className="px-5 py-4 bg-[#0c0c0f]/60 space-y-4">
                        {(p.summary.compositeScore != null || p.summary.technicalScore != null || p.summary.cultureScore != null) && (
                          <div className="flex items-center gap-4 flex-wrap">
                            {p.summary.compositeScore != null && (
                              <div className="flex flex-col items-center bg-[#141416] border border-[#1f1f28] rounded-lg px-4 py-2">
                                <span className="text-lg font-bold text-white">{p.summary.compositeScore.toFixed(1)}</span>
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Composite</span>
                              </div>
                            )}
                            {p.summary.technicalScore != null && (
                              <div className="flex flex-col items-center bg-[#141416] border border-[#1f1f28] rounded-lg px-4 py-2">
                                <span className="text-lg font-bold text-cyan-400">{p.summary.technicalScore.toFixed(1)}</span>
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Technical</span>
                              </div>
                            )}
                            {p.summary.cultureScore != null && (
                              <div className="flex flex-col items-center bg-[#141416] border border-[#1f1f28] rounded-lg px-4 py-2">
                                <span className="text-lg font-bold text-emerald-400">{p.summary.cultureScore.toFixed(1)}</span>
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Culture</span>
                              </div>
                            )}
                          </div>
                        )}
                        {(p.summary.strengths.length > 0 || p.summary.weaknesses.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {p.summary.strengths.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Strengths</p>
                                <ul className="space-y-1">
                                  {p.summary.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-300">
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
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-300">
                                      <span className="text-red-500 mt-0.5 shrink-0">−</span>
                                      <span>{w}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        {p.summary.rankingReasoning && (
                          <div>
                            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Agent Reasoning</p>
                            <p className="text-xs text-zinc-400 leading-relaxed">{p.summary.rankingReasoning}</p>
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

        {/* Recent Evaluations */}
        <div className="bg-[#141416] border border-[#1f1f28] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1f1f28] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-white">Recent Evaluations</h3>
            </div>
            <Link
              href="/dashboard/jobs"
              className="text-xs text-orange-400 hover:text-orange-300"
            >
              View Jobs →
            </Link>
          </div>

          <div className="divide-y divide-[#1e293b]">
            {activityLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#1f1f28] rounded animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-[#1f1f28] rounded w-3/4 animate-pulse" />
                    <div className="h-2.5 bg-[#1f1f28] rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-zinc-500">
                No evaluations yet. Load demo data or create a job and run evaluations.
              </div>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    log.actorType === "agent" ? "bg-orange-500/20" : "bg-emerald-500/20"
                  }`}>
                    {log.actorType === "agent" ? (
                      <Cpu className="w-3 h-3 text-orange-400" />
                    ) : (
                      <Users className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 truncate">
                      {formatEvalAction(log)}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      {log.entityType} · {formatTime(log.createdAt)}
                    </p>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
