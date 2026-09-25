import { NextRequest } from 'next/server'
import { SCENARIOS } from '@/scenarios'
import { createOrchestrator } from '@/lib/orchestrator'
import { sseMessage, sseComment } from '@/lib/sse'
import type { AgentEvent, WorkflowState } from '@/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challengeId = searchParams.get('challenge') ?? 'password-reset'

  const scenario = SCENARIOS[challengeId]
  if (!scenario) {
    return new Response(
      JSON.stringify({ error: `Unknown challenge: ${challengeId}` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const encoder = new TextEncoder()

  let controllerRef: ReadableStreamDefaultController | null = null
  let orchestratorRef: ReturnType<typeof createOrchestrator> | null = null

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller

      // Keep-alive ping
      controller.enqueue(encoder.encode(sseComment('connected')))

      const onEvent = (event: AgentEvent) => {
        try {
          controller.enqueue(encoder.encode(sseMessage('event', event)))
        } catch {
          // Client disconnected
        }
      }

      const onStateChange = (state: WorkflowState) => {
        try {
          controller.enqueue(encoder.encode(sseMessage('state', state)))
        } catch {
          // Client disconnected
        }
      }

      const orchestrator = createOrchestrator(scenario, onEvent, onStateChange)
      orchestratorRef = orchestrator

      orchestrator.start().then((finalState) => {
        try {
          controller.enqueue(encoder.encode(sseMessage('complete', finalState)))
          controller.close()
        } catch {
          // Already closed
        }
      }).catch((err) => {
        try {
          controller.enqueue(encoder.encode(sseMessage('error', { message: String(err) })))
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
    cancel() {
      orchestratorRef?.abort()
    },
  })

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    orchestratorRef?.abort()
    try {
      controllerRef?.close()
    } catch {
      // Already closed
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
