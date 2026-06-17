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
  ExternalLink,
  ChevronDown,
} from "lucide-react"

type Tab = "band" | "candidates"

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
  { id: "band" as Tab, label: "Band Activity", icon: MessageSquare },
  { id: "candidates" as Tab, label: "Candidates & Scores", icon: Users },
]

export default function ResultsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [tab, setTab] = useState<Tab>("band")
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [bandThread, setBandThread] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [bandMode, setBandMode] = useState<"live" | "mock">("mock")
  const [auditOpen, setAuditOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}/results`).then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()).catch(() => ({ bandMode: "mock" })),
    ]).then(([resultsData, configData]) => {
        setData(resultsData)
        setBandMode(configData.bandMode === "live" ? "live" : "mock")
        setLoading(false)
      })
      .catch((err) => { console.error("results fetch error:", err); setError("Failed to load results."); setLoading(false) })
  }, [id])

  const handleApprove = async (
    candidateId: string,
    action: "approve" | "reject" | "review"
  ) => {
    try {
      setApproveError(null)
      const patchRes = await fetch(`/api/decisions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, action }),
      })
      if (!patchRes.ok) {
        setApproveError("Failed to save decision. Please try again.")
        return
      }
      const res = await fetch(`/api/jobs/${id}/results`)
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error("handleApprove error:", err)
      setApproveError("Something went wrong. Please try again.")
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar title="Results" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
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
            className="text-sm text-zinc-400 hover:text-zinc-800"
          >
            Jobs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link
            href={`/dashboard/jobs/${id}`}
            className="text-sm text-zinc-400 hover:text-zinc-800"
          >
            {job.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-sm text-zinc-700">Results</span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Evaluated", value: evaluated, icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Hire", value: hires, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Hold", value: holds, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Reject", value: rejects, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-zinc-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-900">{value}</div>
                <div className="text-xs text-zinc-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white border border-zinc-200 rounded-xl">
          <div className="flex border-b border-zinc-200">
            {TAB_CONFIG.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === tabId
                    ? "text-orange-400 border-orange-500"
                    : "text-zinc-400 border-transparent hover:text-zinc-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Band Activity tab (default) */}
            {tab === "band" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-zinc-900">Band Collaboration Log</h3>
                    {(() => {
                      const activeCandidate = bandThread
                        ? candidates.find((c) => c.bandThreadId === bandThread)
                        : candidates[0]
                      const threadId = activeCandidate?.bandThreadId
                      const isRealThread = threadId && !threadId.startsWith("thread-")
                      if (bandMode === "live" && threadId) {
                        return (
                          <a
                            href={isRealThread ? `https://app.band.ai/chats/${threadId}` : "https://app.band.ai"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors"
                          >
                            View in Band
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )
                      }
                      return (
                        <span
                          title="Available in live Band mode"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed"
                        >
                          View in Band
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )
                    })()}
                  </div>
                  <span className="text-xs text-zinc-400">
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
                          ? "bg-orange-600 text-zinc-900"
                          : "bg-zinc-100 text-zinc-400 hover:text-zinc-800"
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
                              ? "bg-orange-600 text-zinc-900"
                              : "bg-zinc-100 text-zinc-400 hover:text-zinc-800"
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
                  bandMode={bandMode}
                  jobId={id}
                />

                {/* Collapsible audit log */}
                <div className="pt-4 border-t border-zinc-200">
                  <button
                    onClick={() => setAuditOpen(!auditOpen)}
                    className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-700 transition-colors w-full"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${auditOpen ? "rotate-180" : ""}`} />
                    Full Audit Log · {auditLogs.length} events
                  </button>
                  {auditOpen && (
                    <div className="mt-3">
                      <Timeline events={auditLogs} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Candidates & Scores tab */}
            {tab === "candidates" && (
              <div className="space-y-5">
                {/* Score matrix at top */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Score Matrix</h3>
                  <CandidateMatrix
                    candidates={matrixRows}
                    jobId={id}
                    onCandidateClick={(cId) => {
                      setSelectedCandidate(cId === selectedCandidate ? null : cId)
                    }}
                  />
                </div>

                {/* Candidate cards — expanded by default */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900">Candidate Evaluations</h3>
                  {candidates.length === 0 ? (
                    <p className="text-sm text-zinc-400">No candidates evaluated yet.</p>
                  ) : (
                    <>
                    {approveError && (
                      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{approveError}</p>
                    )}
                    {candidates.map((c) => (
                      <CandidateCard
                        key={c.id}
                        id={c.id}
                        name={c.name}
                        email={c.email}
                        status={c.status}
                        evaluations={c.evaluations}
                        decision={c.decision}
                        onApprove={handleApprove}
                        awaitingApproval={!!c.decision && !c.decision.humanDecision}
                      />
                    ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
