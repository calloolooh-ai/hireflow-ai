"use client"

import { useState, useEffect, useRef } from "react"
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

const STATUS_COLORS: Record<string, string> = {
  pending: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  evaluating: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  complete: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  hired: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  hold: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  failed: "text-red-400 bg-red-500/10 border-red-500/20",
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [job, setJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null)
  const [evaluatingAll, setEvaluatingAll] = useState(false)
  const [evalEvents, setEvalEvents] = useState<EvalEvent[]>([])
  const [completedAgents, setCompletedAgents] = useState<AgentType[]>([])
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null)
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
    ]).then(([jobData, candidateData]) => {
      setJob(jobData.job)
      if (jobData.job) {
        const j = jobData.job
        setEditForm({ title: j.title, department: j.department, level: j.level, location: j.location, description: j.description })
      }
      setCandidates(candidateData.candidates || [])
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

  if (loading) {
    return (
      <div>
        <Navbar title="Job Detail" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div>
        <Navbar title="Not Found" />
        <div className="p-6 text-slate-400">Job not found.</div>
      </div>
    )
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

  const hasEvaluated = candidates.some((c) => c.status !== "pending" && c.status !== "evaluating")
  const isEvaluating = !!evaluatingId

  return (
    <div>
      <Navbar title={job.title} subtitle={`${job.department} · ${job.level}`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/jobs"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Jobs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-sm text-slate-300">{job.title}</span>
        </div>

        {/* Job header */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{job.title}</h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {job.department}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {job.location}
                  </div>
                  <span className="px-2 py-0.5 rounded border text-xs font-medium text-blue-400 bg-blue-500/10 border-blue-500/20 capitalize">
                    {job.level}
                  </span>
                  {job.bandRoomId && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                      <Cpu className="w-3 h-3" />
                      Band: {job.bandRoomId.slice(0, 20)}...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasEvaluated && (
                <Link
                  href={`/dashboard/jobs/${id}/results`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-[#1e293b] hover:bg-[#334155] rounded-lg transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Results
                </Link>
              )}
              <button
                onClick={() => { setEditForm({ title: job.title, department: job.department, level: job.level, location: job.location, description: job.description }); setShowEdit(true) }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-[#1e293b] hover:bg-[#334155] rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => setShowAddCandidate(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-[#1e293b] hover:bg-[#334155] rounded-lg transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Candidate
              </button>
              {job.status === "archived" ? (
                <button
                  onClick={unarchiveJob}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-[#1e293b] hover:bg-[#334155] rounded-lg transition-colors"
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

          <div className="mt-4 pt-4 border-t border-[#1e293b]">
            <p className="text-xs text-slate-500 font-medium mb-1">Job Description</p>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
              {job.description}
            </p>
          </div>
        </div>

        {/* Edit job modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl m-4">
              <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Edit Job</h3>
                <button onClick={() => setShowEdit(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleEditJob} className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Title *</label>
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} required className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Department</label>
                    <input type="text" value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Level</label>
                    <select value={editForm.level} onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))} className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs focus:outline-none focus:border-blue-500">
                      {["junior","mid","senior","staff","principal","director"].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Location</label>
                    <input type="text" value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Description</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                  <button type="submit" disabled={editSaving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
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
            <div className="w-full max-w-lg bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl m-4">
              <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Add Candidate</h3>
                <button
                  onClick={() => setShowAddCandidate(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {csvFile ? (
                  /* ── CSV selected state: hide manual form, show import UI ── */
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[#0f172a] border border-blue-500/30 flex items-center gap-3">
                      <Upload className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{csvFile.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Ready to import — format: name, email, resume, linkedin</p>
                      </div>
                      <button
                        onClick={() => setCsvFile(null)}
                        className="text-slate-500 hover:text-slate-300 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setCsvFile(null); setShowAddCandidate(false) }}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCsvUpload}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Import Candidates
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Default state: CSV browse + manual form ── */
                  <>
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-[#0f172a] border border-dashed border-[#334155] hover:border-[#475569] cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-400">Import from CSV</p>
                        <p className="text-[10px] text-slate-600">Format: name, email, resume, linkedin</p>
                      </div>
                      <span className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded-md transition-colors shrink-0">
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
                        <div className="w-full border-t border-[#1e293b]" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-[#111827] text-[10px] text-slate-600 uppercase">or add manually</span>
                      </div>
                    </div>

                    <form onSubmit={handleAddCandidate} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Name *</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            required
                            placeholder="Jane Smith"
                            className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Email *</label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            required
                            placeholder="jane@example.com"
                            className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label>
                        <input
                          type="url"
                          value={form.linkedinUrl}
                          onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Resume Text</label>
                        <textarea
                          value={form.resumeText}
                          onChange={(e) => setForm((f) => ({ ...f, resumeText: e.target.value }))}
                          rows={4}
                          placeholder="Paste resume content here..."
                          className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddCandidate(false)}
                          className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
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

        {/* Candidates + Evaluation */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Candidates */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
            <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white">
                  Candidates ({candidates.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {candidates.some((c) => c.status === "pending") && (
                  <button
                    onClick={evaluateAllPending}
                    disabled={isEvaluating || evaluatingAll}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {evaluatingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Evaluate All
                  </button>
                )}
                <button
                  onClick={() => setShowAddCandidate(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-[#1e293b] hover:bg-[#334155] rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>

            <div className="divide-y divide-[#1e293b]">
              {candidates.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No candidates yet</p>
                  <button
                    onClick={() => setShowAddCandidate(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add first candidate
                  </button>
                </div>
              ) : (
                candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="px-5 py-3.5 flex items-center justify-between group hover:bg-[#1a2235] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {candidate.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {candidate.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span
                        className={`px-2 py-0.5 rounded border text-xs font-medium ${
                          STATUS_COLORS[candidate.status] ||
                          "text-slate-400 bg-slate-500/10 border-slate-500/20"
                        }`}
                      >
                        {candidate.status}
                      </span>

                      <button
                        onClick={() => runEvaluation(candidate.id)}
                        disabled={isEvaluating}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {evaluatingId === candidate.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        {evaluatingId === candidate.id ? "Running..." : "Evaluate"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live evaluation feed */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
            <div className="px-5 py-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">
                  Agent Collaboration Feed
                </h3>
                {isEvaluating && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <AgentStatus
                completedAgents={completedAgents}
                activeAgent={activeAgent}
              />
            </div>

            <div className="p-4">
              <ActivityFeed events={evalEvents} isRunning={isEvaluating} />
            </div>

            {evalEvents.some((e) => e.type === "complete") && (
              <div className="px-5 py-4 border-t border-[#1e293b]">
                <Link
                  href={`/dashboard/jobs/${id}/results`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Full Results
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
