"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { Loader2, Briefcase, ArrowLeft } from "lucide-react"
import Link from "next/link"

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Data Science", "Marketing",
  "Sales", "Operations", "Finance", "HR", "Legal",
]

const LEVELS = ["junior", "mid", "senior", "staff", "principal", "director"]

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    department: "Engineering",
    level: "senior",
    location: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "Failed to create job")
      return
    }

    router.push(`/dashboard/jobs/${data.job.id}`)
  }

  return (
    <div>
      <Navbar title="New Job" subtitle="Create a new position" />
      <div className="p-6 max-w-2xl">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <div className="bg-white border border-zinc-200 rounded-xl">
          <div className="px-6 py-5 border-b border-zinc-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Create Job Position</h2>
              <p className="text-xs text-zinc-400">A Band room will be created automatically for agent collaboration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Senior Frontend Engineer"
                required
                className="w-full px-3 py-2.5 bg-[#0c0c0f] border border-[#1f1f28] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 text-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Department *
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#0c0c0f] border border-[#1f1f28] rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm transition-colors"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Level *
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#0c0c0f] border border-[#1f1f28] rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm transition-colors capitalize"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l} className="capitalize">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Location *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. San Francisco, CA / Remote"
                required
                className="w-full px-3 py-2.5 bg-[#0c0c0f] border border-[#1f1f28] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Job Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, required skills, and what you're looking for in an ideal candidate..."
                required
                rows={8}
                className="w-full px-3 py-2.5 bg-[#0c0c0f] border border-[#1f1f28] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 text-sm transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-zinc-600">
                Include required skills, tech stack, and experience expectations for best agent analysis
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/dashboard/jobs"
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Briefcase className="w-4 h-4" />
                )}
                {loading ? "Creating..." : "Create Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
