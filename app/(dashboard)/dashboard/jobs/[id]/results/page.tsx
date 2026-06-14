"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import BandRoom from "@/components/BandRoom"
import CandidateMatrix from "@/components/CandidateMatrix"
import CandidateCard from "@/components/CandidateCard"
import Timeline from "@/components/Timeline"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  BarChart3,
  Users,
  MessageSquare,
  Clock,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  XCircle,
} from "lucide-react"

type Tab = "overview" | "candidates" | "band" | "audit"

interface ResultsData {
  job: {
    id: string
    title: string
    department: string
    level: string
    bandRoomId: string | null
  }
  candidates: Array<{
    id: string
    name: string
    email: string
    status: string
    bandThreadId: string | null
    evaluations: Array<{ agentType: string; output: string; score: number | null }>
    decision?: {
      decision: "HIRE" | "HOLD" | "REJECT"
      reasoning: string
      compositeScore: number
      confidence: number
      humanDecision?: string | null
    }
  }>
  bandMessages: Array<{
    id: string
    agentType: string
    content: string
    metadata?: Record<string, unknown>
    createdAt: string
    threadId: string
  }>
  auditLogs: Array<{
    id: string
    action: string
    actorType: "agent" | "human"
    actorId: string | null
    entityType: string
    entityId: string
    data: string | null
    createdAt: string
  }>
}

const TAB_CONFIG = [
  { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
  { id: "candidates" as Tab, label: "Candidates", icon: Users },
  { id: "band" as Tab, label: "Band Activity", icon: MessageSquare },
  { id: "audit" as Tab, label: "Audit Trail", icon: Clock },
]

export default function ResultsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [tab, setTab] = useState<Tab>("overview")
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [bandThread, setBandThread] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/jobs/${id}/results`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => { console.error("results fetch error:", err); setError("Failed to load results."); setLoading(false) })
  }, [id])

  const handleApprove = async (
    candidateId: string,
    action: "approve" | "reject" | "review"
  ) => {
    await fetch(`/api/decisions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, action }),
    })
    // Refresh
    const res = await fetch(`/api/jobs/${id}/results`)
    setData(await res.json())
  }

  if (loading) {
    return (
      <div>
        <Navbar title="Results" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar title="Results" />
        <div className="p-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { job, candidates, bandMessages, auditLogs } = data

  const hires = candidates.filter((c) => c.decision?.decision === "HIRE").length
  const holds = candidates.filter((c) => c.decision?.decision === "HOLD").length
  const rejects = candidates.filter((c) => c.decision?.decision === "REJECT").length
  const evaluated = candidates.filter((c) => c.evaluations.length > 0).length

  const matrixRows = candidates.map((c) => {
    const tech = c.evaluations.find((e) => e.agentType === "technical_evaluator")
    const culture = c.evaluations.find((e) => e.agentType === "culture_evaluator")
    const comp = c.evaluations.find((e) => e.agentType === "compensation_agent")
    let compOut: Record<string, unknown> | null = null
    if (comp?.output) {
      try { compOut = JSON.parse(comp.output) } catch { compOut = null }
    }
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      technicalScore: tech?.score ?? null,
      cultureScore: culture?.score ?? null,
      compositeScore: c.decision?.compositeScore ?? null,
      minSalary: typeof compOut?.minSalary === "number" ? compOut.minSalary : null,
      maxSalary: typeof compOut?.maxSalary === "number" ? compOut.maxSalary : null,
      decision: c.decision?.decision ?? null,
      confidence: c.decision?.confidence ?? null,
      status: c.status,
    }
  })

  const selectedBandMessages = bandThread
    ? bandMessages.filter((m) => m.threadId === bandThread)
    : bandMessages

  const threadCandidateMap = new Map(
    candidates.map((c) => [c.bandThreadId, c.name])
  )

  return (
    <div>
      <Navbar title={`${job.title} — Results`} subtitle={`${job.department} · ${job.level}`} />
      <div className="p-6 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/jobs"
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Jobs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link
            href={`/dashboard/jobs/${id}`}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            {job.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-sm text-slate-300">Results</span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Evaluated", value: evaluated, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Hire", value: hires, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Hold", value: holds, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Reject", value: rejects, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#111827] border border-[#1e293b] rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
          <div className="flex border-b border-[#1e293b]">
            {TAB_CONFIG.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === tabId
                    ? "text-blue-400 border-blue-500"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Overview tab */}
            {tab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Candidate Score Matrix</h3>
                <CandidateMatrix
                  candidates={matrixRows}
                  jobId={id}
                  onCandidateClick={(cId) => {
                    setSelectedCandidate(cId === selectedCandidate ? null : cId)
                    setTab("candidates")
                  }}
                />
              </div>
            )}

            {/* Candidates tab */}
            {tab === "candidates" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Candidate Evaluations
                </h3>
                {candidates.length === 0 ? (
                  <p className="text-sm text-slate-500">No candidates evaluated yet.</p>
                ) : (
                  candidates.map((c) => (
                    <CandidateCard
                      key={c.id}
                      id={c.id}
                      name={c.name}
                      email={c.email}
                      status={c.status}
                      evaluations={c.evaluations}
                      decision={c.decision}
                      onApprove={handleApprove}
                    />
                  ))
                )}
              </div>
            )}

            {/* Band Activity tab */}
            {tab === "band" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Band Collaboration Log</h3>
                  <span className="text-xs text-slate-500">
                    {bandMessages.length} messages across {
                      new Set(bandMessages.map((m) => m.threadId)).size
                    } thread(s)
                  </span>
                </div>

                {/* Thread filter */}
                {candidates.some((c) => c.bandThreadId) && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setBandThread(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        !bandThread
                          ? "bg-blue-600 text-white"
                          : "bg-[#1e293b] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All threads
                    </button>
                    {candidates
                      .filter((c) => c.bandThreadId)
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setBandThread(c.bandThreadId!)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            bandThread === c.bandThreadId
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e293b] text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                  </div>
                )}

                <BandRoom
                  messages={selectedBandMessages}
                  roomId={job.bandRoomId || undefined}
                  threadTitle={
                    bandThread
                      ? `Evaluation: ${threadCandidateMap.get(bandThread) || bandThread}`
                      : undefined
                  }
                />
              </div>
            )}

            {/* Audit Trail tab */}
            {tab === "audit" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Complete Audit Trail</h3>
                  <span className="text-xs text-slate-500">
                    {auditLogs.length} events logged
                  </span>
                </div>
                <Timeline events={auditLogs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
