"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, User } from "lucide-react"
import { useSession } from "next-auth/react"

interface NavbarProps {
  title: string
  subtitle?: string
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-6 bg-[#0f172a]/80 backdrop-blur-sm border-b border-[#1e293b]">
      <div className="pl-8 md:pl-0">
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, jobs..."
            className="w-56 pl-8 pr-3 py-1.5 bg-[#111827] border border-[#1e293b] rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </form>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1e293b] transition-colors text-slate-400 hover:text-slate-200">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">
            {session?.user?.name || session?.user?.email || "User"}
          </span>
        </div>
      </div>
    </header>
  )
}
