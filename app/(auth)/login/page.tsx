"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  const handleDemo = async () => {
    setEmail("demo@hireflow.ai")
    setPassword("demo1234")
    setLoading(true)
    const res = await signIn("credentials", {
      email: "demo@hireflow.ai",
      password: "demo1234",
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Demo account not found. Run: npm run db:seed")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Sign in</h1>
      <p className="text-slate-400 text-sm mb-6">
        Welcome back to HireFlow AI
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full px-4 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-slate-300 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          Use Demo Account
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}
