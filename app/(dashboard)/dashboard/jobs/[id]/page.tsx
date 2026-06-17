"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import ActivityFeed from "@/components/ActivityFeed"
import AgentStatus from "@/components/AgentStatus"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Play,
  Users,
  BarChart3,
  Loader2,
  UserPlus,
  Upload,
  X,
  Briefcase,
  MapPin,
  Building2,
  ChevronRight,
  Cpu,
  Archive,
  ArchiveRestore,
  Pencil,
  Check,
  ExternalLink,
} from "lucide-react"
import type { EvalEvent, AgentType } from "@/lib/types"

interface Job {
  id: string
  title: string
  department: string
  level: string
  location: string
  description: string
  status: string
  bandRoomId: string | null
}

interface Candidate {
  id: string
  name: string
  email: string
  resumeText: string | null
  linkedinUrl: string | null
  status: string
  bandThreadId: string | null
}

interface CandidateScores {
  techScore?: number
  cultureScore?: number
  compositeScore?: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
  evaluating: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  complete: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  hired: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  hold: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  failed: "text-red-400 bg-red-500/10 border-red-500/20",
}

const EVALUATED_STATUSES = new Set(["complete", "hired", "rejected", "hold", "failed"])

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [job, setJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [bandMode, setBandMode] = useState<string>("mock")
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null)
  const [evaluatingAll, setEvaluatingAll] = useState(false)
  const [evalEvents, setEvalEvents] = useState<EvalEvent[]>([])
  const [completedAgents, setCompletedAgents] = useState<AgentType[]>([])
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null)
  const [candidateScores, setCandidateScores] = useState<Record<string, CandidateScores>>({})
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    resumeText: "",
    linkedinUrl: "",
  })
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", department: "", level: "", location: "", description: "" })
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then((r) => r.json()),
      fetch(`/api/candidates?jobId=${id}`).then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ]).then(([jobData, candidateData, configData]) => {
      setJob(jobData.job)
      if (jobData.job) {
        const j = jobData.job
        setEditForm({ title: j.title, department: j.department, level: j.level, location: j.location, description: j.description })
      }
      setCandidates(candidateData.candidates || [])
      setBandMode(configData.bandMode ?? "mock")
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, jobId: id }),
    })
    const data = await res.json()
    if (res.ok) {
      setCandidates((prev) => [...prev, data.candidate])
      setForm({ name: "", email: "", resumeText: "", linkedinUrl: "" })
      setShowAddCandidate(false)
    }
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes }
      else if (ch === "," && !inQuotes) { result.push(current.trim()); current = "" }
      else { current += ch }
    }
    result.push(current.trim())
    return result
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return
    const text = await csvFile.text()
    const lines = text.trim().split("\n").slice(1)
    for (const line of lines) {
      const parts = parseCSVLine(line)
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const res = await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: parts[0],
            email: parts[1],
            resumeText: parts[2] || "",
            linkedinUrl: parts[3] || "",
            jobId: id,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setCandidates((prev) => [...prev, data.candidate])
        }
      }
    }
    setCsvFile(null)
  }

  const evaluateAllPending = async () => {
    const pending = candidates.filter((c) => c.status === "pending")
    if (pending.length === 0) return
    setEvaluatingAll(true)
    try {
      for (const c of pending) {
        await runEvaluation(c.id)
      }
    } finally {
      setEvaluatingAll(false)
    }
  }

  const runEvaluation = async (candidateId: string) => {
    setEvaluatingId(candidateId)
    setEvalEvents([])
    setCompletedAgents([])
    setActiveAgent(null)

    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, jobId: id }),
    })

    if (!response.body) return

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event: EvalEvent = JSON.parse(line.slice(6))
            setEvalEvents((prev) => [...prev, event])

            if (event.type === "agent_start" && event.agent) {
              setActiveAgent(event.agent)
            }
            if (event.type === "agent_complete" && event.agent) {
              setCompletedAgents((prev) => [...prev, event.agent!])
              setActiveAgent(null)
            }
            if (event.type === "complete") {
              setActiveAgent(null)
              setEvaluatingId(null)
              // Store scores for this candidate
              if (event.score !== undefined || event.techScore !== undefined || event.cultureScore !== undefined) {
                setCandidateScores((prev) => ({
                  ...prev,
                  [candidateId]: {
                    compositeScore: event.score,
                    techScore: event.techScore,
                    cultureScore: event.cultureScore,
                  },
                }))
              }
              // Refresh candidates
              fetch(`/api/candidates?jobId=${id}`)
                .then((r) => r.json())
                .then((data) => setCandidates(data.candidates || []))
            }
          } catch {
            // skip malformed events
          }
        }
      }
    }

    setEvaluatingId(null)
  }

  const archiveJob = async () => {
    if (!window.confirm("Archive this job? It will be hidden from active listings.")) return
    await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "archived" }) })
    setJob((j) => j ? { ...j, status: "archived" } : j)
  }

  const unarchiveJob = async () => {
    await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "active" }) })
    setJob((j) => j ? { ...j, status: "active" } : j)
  }

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditSaving(true)
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setJob((j) => j ? { ...j, ...editForm } : j)
      setShowEdit(false)
    }
    setEditSaving(false)
  }

  if (loading) {
    return (
      <div>
        <Navbar title="Job Detail" />
        <div className="p-4 sm:p-6 space-y-5">
          {/* Job card skeleton */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-zinc-100" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-zinc-100 rounded w-48" />
                <div className="h-3 bg-zinc-100 rounded w-72" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2">
              <div className="h-3 bg-zinc-100 rounded w-full" />
              <div className="h-3 bg-zinc-100 rounded w-4/5" />
            </div>
          </div>
          {/* Candidate skeleton rows */}
          <div className="bg-white border border-zinc-200 rounded-xl">
            <div className="px-5 py-4 border-b border-zinc-200">
              <div className="h-4 bg-zinc-100 rounded w-32 animate-pulse" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-4 bg-zinc-100 rounded w-36" />
                  <div className="h-3 bg-zinc-100 rounded w-48" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-zinc-100 rounded w-16" />
                  <div className="h-6 bg-zinc-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div>
        <Navbar title="Not Found" />
        <div className="p-6 text-zinc-500">Job not found.</div>
      </div>
    )
  }

  const hasEvaluated = candidates.some((c) => EVALUATED_STATUSES.has(c.status))
  const isEvaluating = !!evaluatingId

  return (
    <div>
      <Navbar title={job.title} subtitle={`${job.department} · ${job.level}`} />
      <div className="p-4 sm:p-6 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/jobs"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Jobs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-sm text-zinc-700">{job.title}</span>
        </div>

        {/* Job Info Card — full width */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-zinc-900">{job.title}</h2>
                  <span className={`px-2 py-0.5 rounded border text-xs font-medium capitalize ${
                    job.status === "archived"
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    {job.department}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {job.location}
                  </div>
                  <span className="px-2 py-0.5 rounded border text-xs font-medium text-orange-400 bg-orange-500/10 border-orange-500/20 capitalize">
                    {job.level}
                  </span>
                  {job.bandRoomId && (
                    bandMode === "live" ? (
                      <a
                        href="https://app.band.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Cpu className="w-3 h-3" />
                        {job.bandRoomId}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium text-zinc-500 bg-zinc-500/10 border-zinc-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        <Cpu className="w-3 h-3" />
                        {job.bandRoomId}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {hasEvaluated && (
                <Link
                  href={`/dashboard/jobs/${id}/results`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Results
                </Link>
              )}
              <button
                onClick={() => { setEditForm({ title: job.title, department: job.department, level: job.level, location: job.location, description: job.description }); setShowEdit(true) }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              {job.status === "archived" ? (
                <button
                  onClick={unarchiveJob}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  <ArchiveRestore className="w-3.5 h-3.5" />
                  Unarchive
                </button>
              ) : (
                <button
                  onClick={archiveJob}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archive
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium mb-1">Job Description</p>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">
              {job.description}
            </p>
          </div>
        </div>

        {/* Edit job modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-2xl m-4">
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">Edit Job</h3>
                <button onClick={() => setShowEdit(false)} className="text-zinc-500 hover:text-zinc-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleEditJob} className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Title *</label>
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} required className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Department</label>
                    <input type="text" value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Level</label>
                    <select value={editForm.level} onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))} className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:outline-none focus:border-orange-500">
                      {["junior","mid","senior","staff","principal","director"].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Location</label>
                    <input type="text" value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Description</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-800">Cancel</button>
                  <button type="submit" disabled={editSaving} className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-zinc-900 text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                    {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add candidate modal */}
        {showAddCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-2xl m-4">
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">Add Candidate</h3>
                <button
                  onClick={() => setShowAddCandidate(false)}
                  className="text-zinc-500 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {csvFile ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[#0c0c0f] border border-orange-500/30 flex items-center gap-3">
                      <Upload className="w-4 h-4 text-orange-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-900 truncate">{csvFile.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Ready to import — format: name, email, resume, linkedin</p>
                      </div>
                      <button
                        onClick={() => setCsvFile(null)}
                        className="text-zinc-500 hover:text-zinc-700 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setCsvFile(null); setShowAddCandidate(false) }}
                        className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCsvUpload}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-zinc-900 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Import Candidates
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-[#0c0c0f] border border-dashed border-[#2a2a36] hover:border-[#475569] cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-zinc-500" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-zinc-500">Import from CSV</p>
                        <p className="text-[10px] text-zinc-400">Format: name, email, resume, linkedin</p>
                      </div>
                      <span className="px-3 py-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors shrink-0">
                        Browse
                      </span>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      />
                    </label>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-[10px] text-zinc-400 uppercase">or add manually</span>
                      </div>
                    </div>

                    <form onSubmit={handleAddCandidate} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            required
                            placeholder="Jane Smith"
                            className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Email *</label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            required
                            placeholder="jane@example.com"
                            className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">LinkedIn URL</label>
                        <input
                          type="url"
                          value={form.linkedinUrl}
                          onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Resume Text</label>
                        <textarea
                          value={form.resumeText}
                          onChange={(e) => setForm((f) => ({ ...f, resumeText: e.target.value }))}
                          rows={4}
                          placeholder="Paste resume content here..."
                          className="w-full px-3 py-2 bg-[#0c0c0f] border border-zinc-200 rounded-lg text-zinc-900 text-xs placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddCandidate(false)}
                          className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-zinc-900 text-xs font-medium rounded-lg transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Add Candidate
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Candidates section — full width */}
        <div className="bg-white border border-zinc-200 rounded-xl">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-900">
                Candidates ({candidates.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {candidates.some((c) => c.status === "pending") && (
                <button
                  onClick={evaluateAllPending}
                  disabled={isEvaluating || evaluatingAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {evaluatingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Evaluate All
                </button>
              )}
              <button
                onClick={() => setShowAddCandidate(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-900 bg-orange-600 hover:bg-orange-500 rounded-md transition-colors font-medium"
              >
                <Plus className="w-3 h-3" />
                Add Candidate
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {candidates.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 font-medium mb-0.5">No candidates yet</p>
                <p className="text-xs text-zinc-400 mb-4">Add candidates to start evaluating</p>
                <button
                  onClick={() => setShowAddCandidate(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-orange-400 hover:text-orange-300 border border-orange-500/20 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add first candidate
                </button>
              </div>
            ) : (
              candidates.map((candidate) => {
                const isThisEvaluating = evaluatingId === candidate.id
                const isEvaluated = EVALUATED_STATUSES.has(candidate.status)
                const showResults = ["complete", "hired", "rejected", "hold"].includes(candidate.status)
                const scores = candidateScores[candidate.id]

                return (
                  <div key={candidate.id} className="group hover:bg-[#1a1a22] transition-colors">
                    {/* Candidate row */}
                    <div className="px-5 py-4 flex flex-wrap items-center gap-3">
                      {/* Name + email */}
                      <div className="flex-1 min-w-0 min-w-[160px]">
                        <div className="text-sm font-medium text-zinc-900 truncate">{candidate.name}</div>
                        <div className="text-xs text-zinc-500 truncate">{candidate.email}</div>
                      </div>

                      {/* Status badge */}
                      <span className={`px-2 py-0.5 rounded border text-xs font-medium shrink-0 ${
                        STATUS_COLORS[candidate.status] || "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                      }`}>
                        {candidate.status}
                      </span>

                      {/* Score pills — shown when evaluated and scores available */}
                      {isEvaluated && scores && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {scores.techScore !== undefined && (
                            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                              Tech {scores.techScore.toFixed(1)}
                            </span>
                          )}
                          {scores.cultureScore !== undefined && (
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              Culture {scores.cultureScore.toFixed(1)}
                            </span>
                          )}
                          {scores.compositeScore !== undefined && (
                            <span className="text-xs font-semibold text-zinc-800 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded">
                              Score {scores.compositeScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        {/* Run Evaluation button — hide while this candidate is evaluating */}
                        {!isThisEvaluating && (
                          <button
                            onClick={() => runEvaluation(candidate.id)}
                            disabled={isEvaluating}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Play className="w-3 h-3" />
                            {isEvaluated ? "Re-evaluate" : "Run Evaluation"}
                          </button>
                        )}
                        {isThisEvaluating && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-orange-400 border border-orange-500/30 rounded-md bg-orange-500/10">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Running...
                          </span>
                        )}
                        {/* View Results link */}
                        {showResults && (
                          <Link
                            href={`/dashboard/jobs/${id}/results`}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-[#2a2a36] rounded-md transition-colors"
                          >
                            View Results
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Inline evaluation feed — only for the actively evaluating candidate */}
                    {isThisEvaluating && (
                      <div className="px-5 pb-5">
                        <div className="mt-1 pt-3 border-t border-zinc-200 space-y-3">
                          <AgentStatus completedAgents={completedAgents} activeAgent={activeAgent} />
                          <ActivityFeed events={evalEvents} isRunning={true} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
