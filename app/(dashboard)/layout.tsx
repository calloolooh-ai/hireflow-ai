"use client"

import { useState } from "react"
import Sidebar from "@/components/Sidebar"
import { Menu } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-40 md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#111827] border border-[#1e293b] text-slate-400 hover:text-slate-200"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
