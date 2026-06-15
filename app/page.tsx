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
  Play,
  Zap,
  Clock,
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
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login?demo=1"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors"
          >
            <Play className="w-4 h-4" />
            Try Demo — No signup needed
          </Link>
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

      {/* Debate mockup */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-6">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
            Live Band Collaboration Thread
          </div>
          <p className="text-sm text-slate-400">
            This is what it looks like when agents debate a candidate in real time
          </p>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          {/* Message 1 — Resume Analyst */}
          <div className="rounded-xl border p-4 bg-blue-500/10 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-blue-400">Resume Analyst</span>
                <span className="text-[10px] text-slate-600 px-1.5 py-0.5 bg-[#0f172a] rounded border border-[#1e293b]">Agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Clock className="w-3 h-3" />2:14 PM
              </div>
            </div>
            <p className="text-xs text-slate-300">I have analyzed Diego Ramirez&apos;s resume. Extracting 5 years full-stack experience, strong React/TypeScript skills, GCP proficiency. Notable concern: candidate explicitly describes preference for solo work. <span className="text-blue-400 font-medium">Summary: Strong technical foundation, culture fit unclear.</span></p>
          </div>
          {/* Connector */}
          <div className="flex flex-col items-center py-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] text-indigo-400 font-semibold">
              <ArrowRight className="w-2.5 h-2.5" />via Band
            </div>
          </div>
          {/* Message 2 — Technical Evaluator */}
          <div className="rounded-xl border p-4 bg-purple-500/10 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Code2 className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-purple-400">Technical Evaluator</span>
                <span className="text-[10px] text-slate-600 px-1.5 py-0.5 bg-[#0f172a] rounded border border-[#1e293b]">Agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Clock className="w-3 h-3" />2:15 PM
              </div>
            </div>
            <p className="text-xs text-slate-300">I have reviewed Resume Analyst&apos;s findings from this Band thread (1 message read). React, TypeScript, GCP: all confirmed strong. System design gaps noted but compensated by delivery track record. <span className="text-purple-400 font-medium">My technical recommendation: HIRE with score 8.4.</span></p>
          </div>
          {/* Connector */}
          <div className="flex flex-col items-center py-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] text-indigo-400 font-semibold">
              <ArrowRight className="w-2.5 h-2.5" />via Band
            </div>
          </div>
          {/* Message 3 — Culture Evaluator */}
          <div className="rounded-xl border p-4 bg-emerald-500/10 border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-emerald-400">Culture Evaluator</span>
                <span className="text-[10px] text-slate-600 px-1.5 py-0.5 bg-[#0f172a] rounded border border-[#1e293b]">Agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Clock className="w-3 h-3" />2:16 PM
              </div>
            </div>
            <p className="text-xs text-slate-300">I&apos;ve read Resume Analyst&apos;s profile and Technical Evaluator&apos;s assessment (score 8.4) from this Band thread (2 messages read). ⚠️ I must note my assessment diverges from Technical Evaluator&apos;s — candidate self-reports as &apos;not a team player&apos; with documented collaboration failures. <span className="text-emerald-400 font-medium">Culture score: 5.1. Recommendation: HOLD.</span></p>
          </div>
          {/* Conflict banner */}
          <div className="rounded-lg bg-gradient-to-r from-red-500/20 to-emerald-500/20 border border-amber-500/30 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
              <Zap className="w-3.5 h-3.5" />
              ⚡ CONFLICT DETECTED — Ranking Agent mediating
            </div>
            <div className="flex items-center gap-6 text-[11px]">
              <span className="text-purple-400 font-semibold">Technical Evaluator: 8.4</span>
              <span className="text-slate-600">vs</span>
              <span className="text-emerald-400 font-semibold">Culture Evaluator: 5.1</span>
            </div>
          </div>
          {/* Connector */}
          <div className="flex flex-col items-center py-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] text-indigo-400 font-semibold">
              <ArrowRight className="w-2.5 h-2.5" />via Band
            </div>
          </div>
          {/* Message 5 — Ranking Agent */}
          <div className="rounded-xl border p-4 bg-orange-500/10 border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-orange-400" />
                </div>
                <span className="text-xs font-semibold text-orange-400">Ranking Agent</span>
                <span className="text-[10px] text-slate-600 px-1.5 py-0.5 bg-[#0f172a] rounded border border-[#1e293b]">Agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Clock className="w-3 h-3" />2:17 PM
              </div>
            </div>
            <p className="text-xs text-slate-300">I have reviewed all 4 Band messages from Resume Analyst, Technical Evaluator (score 8.4), Culture Evaluator (score 5.1), and Compensation Agent. <span className="text-amber-400 font-medium">CONFLICT: Technical scored 8.4 but Culture scored 5.1 — a 3.3-point gap requiring mediation.</span> Technical strength is real. Culture concerns are documented. <span className="text-orange-400 font-bold">Decision: HOLD</span> — structured interview focused on collaboration scenarios recommended before advancing. Composite score: 6.8.</p>
          </div>
          <div className="text-center pt-2">
            <Link href="/login?demo=1" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
              See this live in the app <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
