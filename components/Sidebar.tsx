"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Briefcase,
  LogOut,
  Cpu,
  ChevronRight,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?"
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase()
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [bandLive, setBandLive] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setBandLive(d.bandMode === "live"))
      .catch(() => setBandLive(false))
  }, [])

  const initials = getInitials(session?.user?.name)
  const userName = session?.user?.name ?? "User"

  return (
    <>
      {/* Mobile overlay */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-60 shrink-0 h-screen flex flex-col
          bg-white border-r border-zinc-200
          transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-zinc-200">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shrink-0 orange-glow">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div className="font-bold text-zinc-900 text-sm tracking-tight">HireFlow AI</div>
          </Link>
        </div>

        {/* Band status badge */}
        <div className="px-4 py-3 border-b border-zinc-200">
          {bandLive === null ? (
            <div className="h-7 bg-zinc-100 rounded-md animate-pulse" />
          ) : bandLive ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs text-orange-300 font-medium font-mono">Band Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-500/10 border border-zinc-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <span className="text-xs text-zinc-500 font-medium font-mono">Band Mock Mode</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href)

            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? "bg-orange-600/15 text-orange-400 border border-orange-500/20"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 ml-auto text-orange-400/60" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Agents section */}
        <div className="px-3 pb-3">
          <div className="px-2 py-1.5 mb-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Active Agents
            </span>
          </div>
          <div className="space-y-1">
            {[
              { label: "Resume Analyst", color: "bg-orange-400" },
              { label: "Technical Eval", color: "bg-cyan-400" },
              { label: "Culture Eval", color: "bg-emerald-400" },
              { label: "Compensation", color: "bg-amber-400" },
              { label: "Ranking Agent", color: "bg-orange-500" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 px-2 py-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <span className="text-xs text-zinc-400 font-mono">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User + Sign out */}
        <div className="p-3 border-t border-zinc-200 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-orange-300">{initials}</span>
            </div>
            <span className="text-xs text-zinc-500 truncate">{userName}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
