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
  Cpu,
} from "lucide-react"

const PIPELINE = [
  { label: "Resume Analyst", icon: FileText, dot: "bg-orange-400", color: "text-orange-400" },
  { label: "Technical Evaluator", icon: Code2, dot: "bg-cyan-400", color: "text-cyan-400" },
  { label: "Culture Evaluator", icon: Heart, dot: "bg-emerald-400", color: "text-emerald-400" },
  { label: "Compensation Analyst", icon: DollarSign, dot: "bg-amber-400", color: "text-amber-400" },
  { label: "Ranking Agent", icon: Trophy, dot: "bg-orange-500", color: "text-orange-500" },
]

const FEATURES = [
  {
    icon: Users,
    title: "Multi-Agent Collaboration",
    desc: "Five specialized agents coordinate inside Band rooms, reading each other's work and debating disagreements in real time.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/15",
  },
  {
    icon: ShieldCheck,
    title: "Human-in-the-Loop Approvals",
    desc: "Every recommendation is reviewed by your hiring team. Approve, reject, or request more analysis with one click.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/15",
  },
  {
    icon: ScrollText,
    title: "Full Audit Trail",
    desc: "Every agent message, score, and decision is timestamped, explainable, and searchable. No black-box recommendations.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/15",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0f] text-zinc-100 tech-grid">
      {/* Ambient glow top */}
      <div className="fixed inset-x-0 top-0 h-[400px] pointer-events-none z-0">
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_50%_-10%,rgba(249,115,22,0.10),transparent_65%)]" />
      </div>

      {/* Top nav */}
      <nav className="relative z-10 border-b border-[#1f1f28] bg-[#0c0c0f]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center orange-glow">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">HireFlow AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-orange-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Powered by Band · Band of Agents Hackathon 2026
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
          5 AI Agents.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            One Hiring Decision.
          </span>
          <br className="hidden sm:block" /> Full Transparency.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
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
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm font-semibold text-white transition-colors orange-glow"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Pipeline visualization */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="corner-accent bg-[#141416] border border-[#1f1f28] rounded-2xl p-6 sm:p-8 overflow-hidden">
          <div className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-6">
            ── The Collaboration Pipeline ──
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {PIPELINE.map((agent, i) => {
              const Icon = agent.icon
              return (
                <div key={agent.label} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0c0c0f] border border-[#1f1f28] hover:border-orange-500/25 transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.dot}`} />
                    <Icon className={`w-4 h-4 ${agent.color}`} />
                    <span className="text-xs font-medium text-zinc-300 whitespace-nowrap font-mono">
                      {agent.label}
                    </span>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-orange-500/40 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Debate mockup */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-2">
            ── Live Band Collaboration Thread ──
          </div>
          <p className="text-sm text-zinc-500">
            Watch agents debate a candidate in real time
          </p>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          {/* Resume Analyst */}
          <div className="rounded-xl border p-4 bg-orange-500/8 border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-orange-400" />
                </div>
                <span className="text-xs font-semibold text-orange-400 font-mono">Resume Analyst</span>
                <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-[#0c0c0f] rounded border border-[#1f1f28] font-mono">agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                <Clock className="w-3 h-3" />2:14 PM
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">I have analyzed Diego Ramirez&apos;s resume. Extracting 5 years full-stack experience, strong React/TypeScript skills, GCP proficiency. Notable concern: candidate explicitly describes preference for solo work. <span className="text-orange-400 font-medium">Summary: Strong technical foundation, culture fit unclear.</span></p>
          </div>

          {/* via Band connector */}
          <div className="flex flex-col items-center py-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-400 font-semibold font-mono">
              <ArrowRight className="w-2.5 h-2.5" />via Band
            </div>
          </div>

          {/* Technical Evaluator */}
          <div className="rounded-xl border p-4 bg-cyan-500/8 border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
                  <Code2 className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-xs font-semibold text-cyan-400 font-mono">Technical Evaluator</span>
                <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-[#0c0c0f] rounded border border-[#1f1f28] font-mono">agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                <Clock className="w-3 h-3" />2:15 PM
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">I have reviewed Resume Analyst&apos;s findings from this Band thread (1 message read). React, TypeScript, GCP: all confirmed strong. System design gaps noted but compensated by delivery track record. <span className="text-cyan-400 font-medium">My technical recommendation: HIRE with score 8.4.</span></p>
          </div>

          {/* via Band connector */}
          <div className="flex flex-col items-center py-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-400 font-semibold font-mono">
              <ArrowRight className="w-2.5 h-2.5" />via Band
            </div>
          </div>

          {/* Culture Evaluator */}
          <div className="rounded-xl border p-4 bg-emerald-500/8 border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 font-mono">Culture Evaluator</span>
                <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-[#0c0c0f] rounded border border-[#1f1f28] font-mono">agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                <Clock className="w-3 h-3" />2:16 PM
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">I&apos;ve read Resume Analyst&apos;s profile and Technical Evaluator&apos;s assessment (score 8.4) from this Band thread (2 messages read). ⚠️ My assessment diverges — candidate self-reports as &apos;not a team player&apos; with documented collaboration failures. <span className="text-emerald-400 font-medium">Culture score: 5.1. Recommendation: HOLD.</span></p>
          </div>

          {/* Conflict banner */}
          <div className="rounded-lg bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 mb-1.5 font-mono">
              <Zap className="w-3.5 h-3.5" />
              CONFLICT DETECTED — Ranking Agent mediating
            </div>
            <div className="flex items-center gap-6 text-[11px] font-mono">
              <span className="text-cyan-400 font-semibold">Technical: 8.4</span>
              <span className="text-zinc-600">vs</span>
              <span className="text-emerald-400 font-semibold">Culture: 5.1</span>
            </div>
          </div>

          {/* via Band connector */}
          <div className="flex flex-col items-center py-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-400 font-semibold font-mono">
              <ArrowRight className="w-2.5 h-2.5" />via Band
            </div>
          </div>

          {/* Ranking Agent */}
          <div className="rounded-xl border p-4 bg-orange-500/10 border-orange-500/25">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-orange-400 font-mono">Ranking Agent</span>
                <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-[#0c0c0f] rounded border border-[#1f1f28] font-mono">agent</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                <Clock className="w-3 h-3" />2:17 PM
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">I have reviewed all 4 Band messages from Resume Analyst, Technical Evaluator (score 8.4), Culture Evaluator (score 5.1), and Compensation Agent. <span className="text-amber-400 font-medium">CONFLICT: Technical scored 8.4 but Culture scored 5.1 — a 3.3-point gap requiring mediation.</span> Technical strength is real. Culture concerns are documented. <span className="text-orange-400 font-bold">Decision: HOLD</span> — structured interview focused on collaboration scenarios recommended. Composite score: 6.8.</p>
          </div>

          <div className="text-center pt-2">
            <Link href="/login?demo=1" className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium font-mono">
              See this live in the app <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`corner-accent bg-[#141416] border ${f.border} rounded-2xl p-6 hover:border-orange-500/25 transition-colors`}
              >
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1f1f28]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between text-xs text-zinc-600 font-mono">
          <span>HireFlow AI · Band-native hiring intelligence</span>
          <Link href="/login" className="hover:text-zinc-400 transition-colors">
            Sign In →
          </Link>
        </div>
      </footer>
    </div>
  )
}
