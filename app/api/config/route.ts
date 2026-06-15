import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { AI_MODEL, isDemoMode } from "@/lib/ai/client"
import { bandMode } from "@/lib/band"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  return NextResponse.json({
    isDemoMode,
    bandMode,
    model: AI_MODEL,
  })
}
