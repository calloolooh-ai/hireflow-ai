import { auth } from "@/auth"
import { runEvaluation } from "@/lib/agents/orchestrator"
import type { EvalEvent } from "@/lib/types"

export const maxDuration = 300

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { candidateId, jobId } = await request.json()

  if (!candidateId || !jobId) {
    return new Response("candidateId and jobId required", { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: EvalEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        )
      }

      try {
        await runEvaluation(candidateId, jobId, send)
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Evaluation failed",
          timestamp: new Date().toISOString(),
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
