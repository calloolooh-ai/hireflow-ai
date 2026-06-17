"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

interface NavbarProps {
  title: string
  subtitle?: string
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setIsDemoMode(Boolean(d.isDemoMode)))
      .catch(() => setIsDemoMode(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/dashboard/jobs?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm border-b border-zinc-200">
      <div className="pl-8 md:pl-0">
        <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
        {subtitle && (
          <p className="text-xs text-zinc-400 font-mono">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, jobs..."
            className="w-56 pl-8 pr-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-lg text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-orange-500/40 transition-colors"
          />
        </form>

        {isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            DEMO
          </span>
        )}

      </div>
    </header>
  )
}
