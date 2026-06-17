"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import {
  FileText, Code2, Heart, DollarSign, Trophy, ArrowRight,
  Users, ShieldCheck, ScrollText, Play, Zap, Clock, Cpu,
  ChevronDown, CheckCircle, BarChart3, MessageSquare,
} from "lucide-react"

/* ── Data ── */
const PIPELINE = [
  { label: "Resume Analyst",      short: "RA", icon: FileText,   dot: "bg-orange-400", color: "text-orange-500", border: "border-orange-200", bg: "bg-orange-50",   glow: "rgba(249,115,22,0.2)",  desc: "Extracts skills, experience & patterns" },
  { label: "Technical Evaluator", short: "TE", icon: Code2,      dot: "bg-cyan-400",   color: "text-cyan-600",   border: "border-cyan-200",   bg: "bg-cyan-50",     glow: "rgba(6,182,212,0.2)",   desc: "Scores technical alignment to role" },
  { label: "Culture Evaluator",   short: "CE", icon: Heart,      dot: "bg-emerald-400",color: "text-emerald-600",border: "border-emerald-200",bg: "bg-emerald-50",  glow: "rgba(16,185,129,0.2)",  desc: "Assesses team fit & communication" },
  { label: "Compensation Analyst",short: "CA", icon: DollarSign, dot: "bg-amber-400",  color: "text-amber-600",  border: "border-amber-200",  bg: "bg-amber-50",    glow: "rgba(245,158,11,0.2)",  desc: "Markets salary & estimates fit" },
  { label: "Ranking Agent",       short: "RK", icon: Trophy,     dot: "bg-orange-500", color: "text-orange-600", border: "border-orange-300", bg: "bg-orange-100",  glow: "rgba(249,115,22,0.3)",  desc: "Resolves conflicts & finalises verdict" },
]

const DEBATE_MESSAGES = [
  { agent: "Resume Analyst",      color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-200", icon: FileText, time: "2:14 PM", text: "Analysed Diego Ramirez. 5 yrs full-stack, React/TypeScript, GCP. Concern flagged: candidate explicitly describes preference for solo work.", highlight: "Strong technical foundation, culture fit unclear.", hColor: "text-orange-600" },
  { agent: "Technical Evaluator", color: "text-cyan-600",   bg: "bg-cyan-50",    border: "border-cyan-200",   icon: Code2,    time: "2:15 PM", text: "Read Resume Analyst's findings (1 message). React, TypeScript, GCP all confirmed strong. System design gaps offset by delivery track record.", highlight: "Technical recommendation: HIRE · score 8.4", hColor: "text-cyan-700" },
  { agent: "Culture Evaluator",   color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200",icon: Heart,    time: "2:16 PM", text: "Read both prior messages (2 read). Assessment diverges — candidate self-reports as 'not a team player' with documented collaboration failures.", highlight: "Culture score: 5.1 · Recommendation: HOLD", hColor: "text-emerald-700" },
  { agent: "Ranking Agent",       color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200", icon: Trophy,   time: "2:17 PM", text: "Reviewed all 4 Band messages. CONFLICT: Technical 8.4 vs Culture 5.1 — 3.3-point gap. Technical strength real, culture concerns documented.", highlight: "Decision: HOLD · Composite score: 6.8", hColor: "text-amber-600" },
]

const STATS = [
  { value: "5",   suffix: "",  label: "Collaborating agents",    icon: Users,        color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-100" },
  { value: "87",  suffix: "%", label: "Faster hiring decisions", icon: BarChart3,    color: "text-cyan-600",   bg: "bg-cyan-50",    border: "border-cyan-100" },
  { value: "100", suffix: "%", label: "Explainable every time",  icon: CheckCircle,  color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-100" },
]

const FEATURES = [
  { icon: Users,       title: "Agent-to-Agent Handoffs",   desc: "Each agent reads the Band thread, builds on prior findings, and hands context to the next — no repeated analysis, no lost signal.", color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-100" },
  { icon: ShieldCheck, title: "Human-in-the-Loop",         desc: "Every recommendation waits for your team. Approve, reject, or request deeper analysis — you stay in control of every hire.",       color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-100" },
  { icon: ScrollText,  title: "Full Audit Trail",           desc: "Every message, score, and decision is timestamped and searchable in Band. Complete explainability, zero black-box risk.",           color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100" },
]

/* ── Scroll reveal hook ── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-left, .reveal-right")
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible") }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── Animated counter ── */
function useCounter(target: number, duration = 1600, trigger: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, trigger])
  return val
}

/* ── Stat card ── */
function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)
  const count = useCounter(parseInt(stat.value), 1600, triggered)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const Icon = stat.icon
  return (
    <div ref={ref} className={`reveal d${index + 1} card-lift bg-white border ${stat.border} rounded-2xl p-8 text-center`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} mb-4`}>
        <Icon className={`w-6 h-6 ${stat.color}`} />
      </div>
      <div className={`text-5xl font-bold font-mono mb-1 ${stat.color}`}>
        {triggered ? count : 0}{stat.suffix}
      </div>
      <div className="text-sm text-zinc-500">{stat.label}</div>
    </div>
  )
}

/* ── Typewriter ── */
function Typewriter({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[idx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1))
        if (text.length + 1 === word.length) setTimeout(() => setDeleting(true), 1800)
      } else {
        setText(word.slice(0, text.length - 1))
        if (text.length - 1 === 0) { setDeleting(false); setIdx((i) => (i + 1) % words.length) }
      }
    }, deleting ? 40 : 80)
    return () => clearTimeout(timeout)
  }, [text, deleting, idx, words])

  return <span className="text-orange-500">{text}<span className="typing-cursor" /></span>
}

/* ── Pipeline flow dot ── */
function FlowDot({ delay }: { delay: number }) {
  return (
    <span
      className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-orange-400 -translate-y-1/2"
      style={{ animation: `data-flow 2.4s ${delay}s ease-in-out infinite` }}
    />
  )
}

/* ── Page ── */
export default function LandingPage() {
  useReveal()

  const [mousePos, setMousePos] = useState({ x: 50, y: 30 })
  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center animate-glow-pulse">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900">HireFlow AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden tech-grid"
        onMouseMove={handleMouse}
      >
        {/* Subtle mouse-follow tint — orange wash, no gradient */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-40"
          style={{ background: `radial-gradient(500px circle at ${mousePos.x}% ${mousePos.y}%, rgba(249,115,22,0.06), transparent 55%)` }}
        />

        {/* Floating agent orbs */}
        <div className="absolute inset-0 pointer-events-none">
          {PIPELINE.slice(0, 4).map((agent, i) => {
            const angles = [30, 100, 200, 290]
            const radii = [180, 220, 190, 230]
            const angle = (angles[i] * Math.PI) / 180
            const r = radii[i]
            const x = 50 + (r / 8) * Math.cos(angle)
            const y = 50 + (r / 14) * Math.sin(angle)
            const delays = [0, 1.2, 2.4, 3.6]
            return (
              <div
                key={agent.label}
                className={`absolute ${i % 2 === 1 ? "animate-float-slow" : "animate-float"}`}
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delays[i]}s`, transform: "translate(-50%,-50%)" }}
              >
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${agent.border} ${agent.bg} shadow-sm opacity-70`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.dot}`} />
                  <agent.icon className={`w-3.5 h-3.5 ${agent.color}`} />
                  <span className={`text-[10px] font-mono font-semibold ${agent.color} hidden sm:block`}>{agent.short}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle bg-orange-300/40"
            style={{
              left: `${12 + i * 14}%`,
              bottom: `${10 + (i % 3) * 18}%`,
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
              animationDuration: `${5 + i * 1.5}s`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-medium text-orange-600 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Powered by Band · Hackathon 2026
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-zinc-900 mb-4">
            5 AI Agents.<br />
            <Typewriter words={["One Hiring Decision.", "Total Transparency.", "No Black Boxes.", "Real Collaboration."]} />
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-500 leading-relaxed">
            Specialized agents collaborate inside Band — reading each other&apos;s work, debating disagreements, and producing explainable hiring recommendations your team can trust.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login?demo=1"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-sm font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] active:scale-95"
            >
              <Play className="w-4 h-4" />
              Watch Live Demo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-sm font-semibold text-zinc-700 transition-all shadow-sm"
            >
              Get Started Free
            </Link>
          </div>

          <div className="mt-20 flex flex-col items-center gap-2 text-zinc-400 animate-bounce-down">
            <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="relative py-32 px-6 max-w-6xl mx-auto">
        <div className="reveal text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">
            <MessageSquare className="w-3 h-3" /> The Collaboration Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">Agents that talk to each other</h2>
          <p className="mt-3 text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            Every agent reads the Band thread before acting. Context flows forward — nothing is repeated, nothing is lost.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-0">
          {PIPELINE.map((agent, i) => {
            const Icon = agent.icon
            return (
              <div key={agent.label} className={`reveal d${i + 1} flex items-center gap-0`}>
                <div
                  className={`card-lift flex flex-col items-center gap-3 px-5 py-5 rounded-2xl border ${agent.border} bg-white shadow-sm group transition-all`}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 24px ${agent.glow}`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")}
                >
                  <div className={`w-12 h-12 rounded-xl ${agent.bg} border ${agent.border} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${agent.color}`} />
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-bold font-mono ${agent.color}`}>{agent.short}</div>
                    <div className="text-[10px] text-zinc-400 max-w-[90px] leading-tight mt-0.5">{agent.desc}</div>
                  </div>
                </div>

                {i < PIPELINE.length - 1 && (
                  <div className="relative w-10 sm:w-14 h-px bg-zinc-200 data-line mx-1 shrink-0">
                    <FlowDot delay={i * 0.5} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="reveal mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] text-orange-600 font-mono">
            <ArrowRight className="w-3 h-3" />
            All communication flows through Band
          </span>
        </div>
      </section>

      {/* ── Debate theater ── */}
      <section className="relative py-24 px-6 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="reveal text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">
              <Zap className="w-3 h-3 text-amber-500" /> Live Band Thread
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">Watch agents debate a hire</h2>
            <p className="mt-3 text-sm text-zinc-500 max-w-lg mx-auto">
              Conflict resolution, context handoffs, and final verdicts — all visible in Band.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3">
            {/* Band header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-orange-100 border border-orange-200 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-zinc-600 font-mono">band://hiring/diego-ramirez</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">4 messages</span>
            </div>

            {DEBATE_MESSAGES.map((msg, i) => {
              const Icon = msg.icon
              return (
                <div key={i}>
                  <div className={`reveal d${i + 1} rounded-xl border p-4 ${msg.bg} ${msg.border}`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${msg.border} ${msg.bg}`}>
                          <Icon className={`w-3 h-3 ${msg.color}`} />
                        </div>
                        <span className={`text-xs font-semibold font-mono ${msg.color}`}>{msg.agent}</span>
                        <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200 font-mono">agent</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                        <Clock className="w-3 h-3" />{msg.time}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {msg.text}{" "}
                      <span className={`font-semibold ${msg.hColor}`}>{msg.highlight}</span>
                    </p>
                  </div>

                  {i < DEBATE_MESSAGES.length - 1 && i !== 2 && (
                    <div className="flex flex-col items-center py-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 border border-orange-200 rounded text-[10px] text-orange-500 font-mono">
                        <ArrowRight className="w-2.5 h-2.5" />via Band
                      </div>
                    </div>
                  )}

                  {i === 2 && (
                    <div className="reveal bg-orange-50 border border-orange-200 rounded-lg px-5 py-3.5 my-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-orange-600 mb-2 font-mono">
                        <Zap className="w-3.5 h-3.5" />
                        CONFLICT DETECTED — Ranking Agent mediating
                      </div>
                      <div className="flex items-center gap-6 text-xs font-mono">
                        <span className="text-cyan-600 font-semibold">Technical: <span className="text-cyan-700">8.4</span></span>
                        <span className="text-zinc-400">vs</span>
                        <span className="text-emerald-600 font-semibold">Culture: <span className="text-emerald-700">5.1</span></span>
                        <span className="ml-auto text-zinc-400">Δ 3.3 pts</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="reveal pt-2 text-center">
              <Link href="/login?demo=1" className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors font-mono">
                See this live in the app <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative py-28 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="relative pb-28 px-6 max-w-6xl mx-auto">
        <div className="reveal text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">Enterprise-ready from day one</h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-lg mx-auto">
            Built for hiring managers who need speed, auditability, and control.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={f.title} className={`reveal d${i + 1} card-lift corner-accent bg-white border ${f.border} rounded-2xl p-7 shadow-sm`}>
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 px-6 bg-orange-500 overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="reveal">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-8">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Start hiring with<br />AI that explains itself.
            </h2>
            <p className="text-orange-100 mb-10 text-base max-w-xl mx-auto leading-relaxed">
              No black boxes. No guesswork. Five agents. One decision. Full transparency through Band.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login?demo=1"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-orange-50 text-sm font-bold text-orange-600 transition-all shadow-sm active:scale-95"
              >
                <Play className="w-4 h-4" />
                Try Live Demo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 text-sm font-bold text-white transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-100 border border-orange-200 flex items-center justify-center">
              <Cpu className="w-3 h-3 text-orange-500" />
            </div>
            HireFlow AI · Band-native hiring intelligence
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login"  className="hover:text-zinc-600 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-zinc-600 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
