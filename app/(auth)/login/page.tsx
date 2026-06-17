"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, LogIn, Play } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get("demo") === "1"
  const [email, setEmail] = useState(isDemo ? "demo@hireflow.ai" : "")
  const [password, setPassword] = useState(isDemo ? "demo1234" : "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isDemo) {
      handleDemo()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div className="bg-white rounded-xl border border-zinc-200 p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sign in</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Welcome back to HireFlow AI
      </p>

      {isDemo && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <Play className="w-4 h-4 shrink-0" />
          Demo mode — credentials pre-filled. Signing you in…
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
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
          className="w-full px-4 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          Use Demo Account
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-xl border border-zinc-200 p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
