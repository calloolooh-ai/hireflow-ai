"use client"

import Navbar from "@/components/Navbar"
import { useSession } from "next-auth/react"
import { Settings, Cpu, MessageSquare, Key, Info } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div>
      <Navbar title="Settings" subtitle="Configuration and integrations" />
      <div className="p-6 space-y-5 max-w-2xl">
        {/* Account */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Account</h3>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
              <div className="px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-sm text-slate-300">
                {session?.user?.name || "—"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <div className="px-3 py-2 bg-[#0f172a] border border-[#1e293b] rounded-lg text-sm text-slate-300">
                {session?.user?.email || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">AI Configuration</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Featherless.ai API</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Set FEATHERLESS_API_KEY in .env.local
                </div>
              </div>
              <span className="px-2.5 py-1 rounded border text-xs font-medium text-amber-400 bg-amber-500/10 border-amber-500/20">
                Demo Mode
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Default Model</div>
              <div className="text-xs text-slate-400 mt-1 font-mono bg-[#0f172a] px-3 py-2 rounded-lg border border-[#1e293b]">
                meta-llama/Llama-3.3-70B-Instruct
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Override with AI_MODEL environment variable
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400">
                  In demo mode, agents use realistic pre-crafted responses.
                  All Band collaboration logic still runs — agents still read each
                  other&apos;s messages from the Band thread.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Band Configuration */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Band Integration</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Band API</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Set BAND_API_KEY in .env.local for live mode
                </div>
              </div>
              <span className="px-2.5 py-1 rounded border text-xs font-medium text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                Mock Mode
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-400 leading-relaxed">
                In mock mode, Band messages are stored in SQLite and all agent
                coordination still works. Agents create rooms, open threads,
                post messages, and read prior context — identical to live Band.
              </div>
            </div>
            <div className="space-y-2">
              {[
                "createRoom(name, description)",
                "createThread(roomId, title)",
                "postMessage(roomId, threadId, agentType, content)",
                "fetchMessages(roomId, threadId)",
              ].map((fn) => (
                <div
                  key={fn}
                  className="px-3 py-1.5 bg-[#0f172a] border border-[#1e293b] rounded text-xs text-slate-400 font-mono"
                >
                  {fn}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1e293b] flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Environment Variables</h3>
          </div>
          <div className="p-5">
            <div className="space-y-2 font-mono text-xs">
              {[
                { key: "DATABASE_URL", example: "file:./hireflow.db" },
                { key: "NEXTAUTH_SECRET", example: "your-secret-32chars" },
                { key: "NEXTAUTH_URL", example: "http://localhost:3000" },
                { key: "FEATHERLESS_API_KEY", example: "your-key (optional)" },
                { key: "AI_MODEL", example: "meta-llama/Llama-3.3-70B-Instruct" },
                { key: "BAND_API_KEY", example: "your-key (optional)" },
                { key: "BAND_API_URL", example: "https://api.band.dev/v1" },
              ].map(({ key, example }) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded bg-[#0f172a] border border-[#1e293b]">
                  <span className="text-blue-400 shrink-0">{key}</span>
                  <span className="text-slate-700">=</span>
                  <span className="text-slate-500">{example}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
