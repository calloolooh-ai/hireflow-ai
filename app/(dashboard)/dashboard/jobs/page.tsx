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
    mid: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    senior: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    staff: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    principal: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    director: "text-red-400 bg-red-500/10 border-red-500/20",
  }

  return (
    <div>
      <Navbar title="Jobs" subtitle="Manage open positions" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-1 p-1 bg-white border border-zinc-200 rounded-lg w-fit">
          {(["active", "archived"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                tab === t ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Job
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
            <Briefcase className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-zinc-400 mb-1">
              {search ? "No jobs found" : "No jobs yet"}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              {search
                ? "Try a different search term"
                : "Create your first job to start evaluating candidates"}
            </p>
            {!search && (
              <Link
                href="/dashboard/jobs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Job
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">
                    Level
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">
                    Location
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-zinc-50 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                          <Briefcase className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="text-sm font-medium text-zinc-900 hover:text-orange-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
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
                          "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                        }`}
                      >
                        {job.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-700">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        {job.candidateCount}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${
                          job.status === "active"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
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
                            className="p-1.5 rounded-md text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => unarchiveJob(job.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
                            title="Unarchive"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5" />
                            Unarchive
                          </button>
                        )}
                        <Link
                          href={`/dashboard/jobs/${job.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
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
