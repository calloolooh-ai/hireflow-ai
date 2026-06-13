"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { Search, Briefcase, Users, Loader2 } from "lucide-react"
import { Suspense } from "react"

interface SearchResults {
  jobs: Array<{ id: string; title: string; department: string; status: string }>
  candidates: Array<{ id: string; name: string; email: string; jobId: string; status: string }>
}

function SearchResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results)
        setLoading(false)
      })
  }, [q])

  const total = (results?.jobs.length || 0) + (results?.candidates.length || 0)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <Search className="w-4 h-4 text-slate-500" />
        <span className="text-slate-400">
          {q ? (
            <>Results for <span className="text-white font-medium">&quot;{q}&quot;</span>
            {!loading && results && ` — ${total} found`}</>
          ) : (
            "Enter a search query"
          )}
        </span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Searching...</span>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          {results.jobs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Jobs ({results.jobs.length})
                </h3>
              </div>
              <div className="space-y-1">
                {results.jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 bg-[#111827] border border-[#1e293b] rounded-lg hover:border-[#334155] transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{job.title}</div>
                      <div className="text-xs text-slate-500">{job.department}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      job.status === "active"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-slate-500 bg-slate-500/10 border-slate-500/20"
                    }`}>
                      {job.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.candidates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Candidates ({results.candidates.length})
                </h3>
              </div>
              <div className="space-y-1">
                {results.candidates.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/jobs/${c.jobId}/results`}
                    className="flex items-center justify-between p-3 bg-[#111827] border border-[#1e293b] rounded-lg hover:border-[#334155] transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                    </div>
                    <span className="text-xs text-slate-500 capitalize">{c.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="text-center py-12 text-sm text-slate-500">
              No results for &quot;{q}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <div>
      <Navbar title="Search" subtitle="Find candidates, jobs, and decisions" />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  )
}
