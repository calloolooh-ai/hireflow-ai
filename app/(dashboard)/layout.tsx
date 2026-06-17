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
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-40 md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800"
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
