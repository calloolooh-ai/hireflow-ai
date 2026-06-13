import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, ensureInit } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"
import { desc } from "drizzle-orm"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureInit()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)

  return NextResponse.json({ logs })
}
