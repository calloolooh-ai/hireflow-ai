"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
  Plus,
  Briefcase,
  Users,
  ChevronRight,
  Archive,
  ArchiveRestore,
  MapPin,
  Building2,
  Loader2,
  Search,
} from "lucide-react"

interface Job {
  id: string
  title: string
  department: string
  level: string
  location: string
  status: string
  candidateCount: number
  createdAt: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"active" | "archived">("active")

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs || [])
        setLoading(false)
      })
      .catch((err) => { console.error("jobs fetch error:", err); setLoading(false) })
  }, [])

  const unarchiveJob = async (id: string) => {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    })
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "active" } : j)))
    setTab("active")
  }

  const filtered = jobs.filter(
    (j) =>
      j.status === tab &&
      (j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase()))
  )

  const archiveJob = async (id: string) => {
    if (!window.confirm("Archive this job? It will be hidden from active listings.")) return
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    })
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "archived" } : j)))
  }

  const LEVEL_COLOR: Record<string, string> = {
    junior: "text-green-400 bg-green-500/10 border-green-500/20",
    mid: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    senior: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    staff: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    principal: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    director: "text-red-400 bg-red-500/10 border-red-500/20",
  }

  return (
    <div>
      <Navbar title="Jobs" subtitle="Manage open positions" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-1 p-1 bg-[#111827] border border-[#1e293b] rounded-lg w-fit">
          {(["active", "archived"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                tab === t ? "bg-[#1e293b] text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-8 pr-3 py-2 bg-[#111827] border border-[#1e293b] rounded-lg text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Job
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#111827] border border-[#1e293b] rounded-xl">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-400 mb-1">
              {search ? "No jobs found" : "No jobs yet"}
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              {search
                ? "Try a different search term"
                : "Create your first job to start evaluating candidates"}
            </p>
            {!search && (
              <Link
                href="/dashboard/jobs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Job
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Level
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    Location
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-[#1a2235] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {job.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium capitalize ${
                          LEVEL_COLOR[job.level.toLowerCase()] ||
                          "text-slate-400 bg-slate-500/10 border-slate-500/20"
                        }`}
                      >
                        {job.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {job.candidateCount}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${
                          job.status === "active"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-slate-500 bg-slate-500/10 border-slate-500/20"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.status === "active" ? (
                          <button
                            onClick={() => archiveJob(job.id)}
                            className="p-1.5 rounded-md text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => unarchiveJob(job.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-[#1e293b] hover:bg-[#334155] rounded-md transition-colors"
                            title="Unarchive"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5" />
                            Unarchive
                          </button>
                        )}
                        <Link
                          href={`/dashboard/jobs/${job.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#1e293b] hover:bg-[#334155] rounded-md transition-colors"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
