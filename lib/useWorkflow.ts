'use client'

import { useState, useRef, useCallback } from 'react'
import type { AgentEvent, FileDiff, Finding, Metrics, WorkflowState, WorkflowStatus } from '@/types'

const EMPTY_METRICS: Metrics = {
  iterations: 0,
  issues_found: 0,
  issues_fixed: 0,
  tests_generated: 0,
  tests_passed: 0,
  tests_failed: 0,
  critical_issues: 0,
  files_changed: 0,
  duration_seconds: 0,
}

interface UseWorkflowReturn {
  status: WorkflowStatus
  events: AgentEvent[]
  findings: Finding[]
  diffs: FileDiff[]
  metrics: Metrics
  currentRound: number
  totalRounds: number
  finalState: WorkflowState | null
  error: string | null
  lastBobMessage: string
  lastMycrosaiftMessage: string
  start: (challengeId: string) => void
  reset: () => void
}

export function useWorkflow(): UseWorkflowReturn {
  const [status, setStatus] = useState<WorkflowStatus>('idle')
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [diffs, setDiffs] = useState<FileDiff[]>([])
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS)
  const [currentRound, setCurrentRound] = useState(0)
  const [totalRounds, setTotalRounds] = useState(0)
  const [finalState, setFinalState] = useState<WorkflowState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastBobMessage, setLastBobMessage] = useState('')
  const [lastMycrosaiftMessage, setLastMycrosaiftMessage] = useState('')

  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus('idle')
    setEvents([])
    setFindings([])
    setDiffs([])
    setMetrics({ ...EMPTY_METRICS })
    setCurrentRound(0)
    setTotalRounds(0)
    setFinalState(null)
    setError(null)
    setLastBobMessage('')
    setLastMycrosaiftMessage('')
  }, [])

  const start = useCallback((challengeId: string) => {
    // Cancel any running stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Reset state
    setStatus('idle')
    setEvents([])
    setFindings([])
    setDiffs([])
    setMetrics({ ...EMPTY_METRICS })
    setCurrentRound(0)
    setTotalRounds(0)
    setFinalState(null)
    setError(null)
    setLastBobMessage('')
    setLastMycrosaiftMessage('')

    const url = `/api/workflow/stream?challenge=${encodeURIComponent(challengeId)}`

    // Use fetch with streaming instead of EventSource for abort support
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Parse SSE messages from buffer
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data:')) continue
            const raw = line.slice('data:'.length).trim()
            if (!raw) continue

            try {
              const msg = JSON.parse(raw) as { type: string; payload: unknown }

              if (msg.type === 'event') {
                const event = msg.payload as AgentEvent
                setEvents((prev) => [...prev, event])
                if (event.agent === 'BOB' && event.type !== 'separator') {
                  setLastBobMessage(event.message)
                }
                if (event.agent === 'MYCROSAIFT' && event.type !== 'separator') {
                  setLastMycrosaiftMessage(event.message)
                }
              } else if (msg.type === 'state') {
                const state = msg.payload as WorkflowState
                setStatus(state.status)
                setCurrentRound(state.current_round)
                setTotalRounds(state.total_rounds)
                setMetrics({ ...state.metrics })
                // Merge findings with animation (replace full array from state)
                setFindings([...state.findings])
                setDiffs([...state.diffs])
              } else if (msg.type === 'complete') {
                const state = msg.payload as WorkflowState
                setFinalState(state)
                setStatus(state.status)
                setMetrics({ ...state.metrics })
                setFindings([...state.findings])
              } else if (msg.type === 'error') {
                const errPayload = msg.payload as { message: string }
                setError(errPayload.message)
                setStatus('error')
              }
            } catch {
              // Ignore malformed lines
            }
          }
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      })
  }, [])

  return {
    status,
    events,
    findings,
    diffs,
    metrics,
    currentRound,
    totalRounds,
    finalState,
    error,
    lastBobMessage,
    lastMycrosaiftMessage,
    start,
    reset,
  }
}
