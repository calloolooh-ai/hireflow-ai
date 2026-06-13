"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Cpu,
  ChevronRight,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[#111827] border-r border-[#1e293b]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1e293b]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">HireFlow AI</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Multi-Agent
            </div>
          </div>
        </Link>
      </div>

      {/* Band status badge */}
      <div className="px-4 py-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-blue-300 font-medium">Band Connected</span>
        </div>
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
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 ml-auto text-blue-400/60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Agents section */}
      <div className="px-3 pb-3">
        <div className="px-2 py-1.5 mb-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Agents
          </span>
        </div>
        <div className="space-y-1">
          {[
            { label: "Resume Analyst", color: "bg-blue-400" },
            { label: "Technical Eval", color: "bg-purple-400" },
            { label: "Culture Eval", color: "bg-emerald-400" },
            { label: "Compensation", color: "bg-amber-400" },
            { label: "Ranking Agent", color: "bg-orange-400" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 px-2 py-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="p-3 border-t border-[#1e293b]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
