import Link from "next/link"
import {
  FileText,
  Code2,
  Heart,
  DollarSign,
  Trophy,
  ArrowRight,
  Users,
  ShieldCheck,
  ScrollText,
} from "lucide-react"

const PIPELINE = [
  { label: "Resume Analyst", icon: FileText, dot: "bg-blue-400", color: "text-blue-400" },
  { label: "Technical Evaluator", icon: Code2, dot: "bg-purple-400", color: "text-purple-400" },
  { label: "Culture Evaluator", icon: Heart, dot: "bg-emerald-400", color: "text-emerald-400" },
  { label: "Compensation Analyst", icon: DollarSign, dot: "bg-amber-400", color: "text-amber-400" },
  { label: "Ranking Agent", icon: Trophy, dot: "bg-orange-400", color: "text-orange-400" },
]

const FEATURES = [
  {
    icon: Users,
    title: "Multi-Agent Collaboration",
    desc: "Five specialized agents coordinate inside Band rooms, reading each other's work and debating disagreements in real time.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Human-in-the-Loop Approvals",
    desc: "Every recommendation is reviewed by your hiring team. Approve, reject, or request more analysis with one click.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: ScrollText,
    title: "Full Audit Trail",
    desc: "Every agent message, score, and decision is timestamped, explainable, and searchable. No black-box recommendations.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      {/* Top nav */}
      <nav className="border-b border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">HireFlow AI</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Powered by Band · Band of Agents Hackathon 2026
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          5 AI Agents. One Hiring
          <br className="hidden sm:block" /> Decision. Full Transparency.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
          HireFlow AI transforms hiring into a transparent multi-agent collaboration
          — powered by Band.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-lg border border-[#1e293b] hover:border-[#334155] text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Pipeline visualization */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 sm:p-8">
          <div className="text-center text-xs font-medium uppercase tracking-wider text-slate-500 mb-6">
            The Collaboration Pipeline
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {PIPELINE.map((agent, i) => {
              const Icon = agent.icon
              return (
                <div key={agent.label} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b]">
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.dot}`} />
                    <Icon className={`w-4 h-4 ${agent.color}`} />
                    <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                      {agent.label}
                    </span>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 hover:border-[#334155] transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between text-xs text-slate-600">
          <span>HireFlow AI · Band-native hiring intelligence</span>
          <Link href="/login" className="hover:text-slate-400 transition-colors">
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  )
}
