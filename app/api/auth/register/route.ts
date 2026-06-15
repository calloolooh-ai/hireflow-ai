import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db, ensureInit } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    entry.count++
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
  }

  try {
    await ensureInit()
    const { name, email, password } = await request.json()

    const trimmedName = name?.trim()
    if (!trimmedName || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing[0]) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await db.insert(users).values({
      id: randomUUID(),
      email,
      password: hashed,
      name,
      role: "user",
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
