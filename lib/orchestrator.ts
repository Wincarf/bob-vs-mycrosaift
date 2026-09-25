import type {
  AgentEvent,
  AgentName,
  Finding,
  FileDiff,
  Metrics,
  Round,
  ScenarioScript,
  TestResult,
  WorkflowState,
  WorkflowStatus,
  FindingStatus,
} from '@/types'

let _eventCounter = 0
function makeId(): string {
  return `evt-${Date.now()}-${++_eventCounter}`
}

function makeTimestamp(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Delay between each event emission (milliseconds)
const EVENT_DELAY = 700

export class WorkflowOrchestrator {
  private scenario: ScenarioScript
  private onEvent: (event: AgentEvent) => void
  private onStateChange: (state: WorkflowState) => void
  private aborted = false
  private state: WorkflowState

  constructor(
    scenario: ScenarioScript,
    onEvent: (event: AgentEvent) => void,
    onStateChange: (state: WorkflowState) => void
  ) {
    this.scenario = scenario
    this.onEvent = onEvent
    this.onStateChange = onStateChange
    this.state = this.initialState()
  }

  private initialState(): WorkflowState {
    return {
      status: 'idle',
      task: this.scenario.task_description,
      challenge_id: this.scenario.challenge_id,
      current_round: 0,
      total_rounds: this.scenario.rounds.length,
      events: [],
      findings: [],
      diffs: [],
      test_results: [],
      metrics: {
        iterations: 0,
        issues_found: 0,
        issues_fixed: 0,
        tests_generated: 0,
        tests_passed: 0,
        tests_failed: 0,
        critical_issues: 0,
        files_changed: 0,
        duration_seconds: 0,
      },
    }
  }

  private emit(
    agent: AgentName,
    message: string,
    type: AgentEvent['type'] = 'info'
  ) {
    const event: AgentEvent = {
      id: makeId(),
      timestamp: makeTimestamp(),
      agent,
      message,
      type,
    }
    this.state.events.push(event)
    this.onEvent(event)
  }

  private setStatus(status: WorkflowStatus) {
    this.state.status = status
    this.onStateChange({ ...this.state })
  }

  private notifyState() {
    this.onStateChange({ ...this.state })
  }

  async start(): Promise<WorkflowState> {
    this.aborted = false
    const startTime = Date.now()

    this.emit('SYSTEM', `Starting workflow: ${this.scenario.challenge_name}`, 'info')
    this.emit('SYSTEM', `Task: ${this.scenario.task_description}`, 'info')
    this.emit('SYSTEM', `Rounds planned: ${this.scenario.rounds.length}`, 'info')
    this.emit('SYSTEM', '─'.repeat(48), 'separator')

    await sleep(EVENT_DELAY)

    for (const round of this.scenario.rounds) {
      if (this.aborted) break

      this.state.current_round = round.round_number
      this.emit('SYSTEM', `━━━ ROUND ${round.round_number} OF ${this.scenario.rounds.length} ━━━`, 'separator')
      await sleep(EVENT_DELAY / 2)

      // ── BOB PHASE ──────────────────────────────────────────────────────
      const isFirstRound = round.round_number === 1
      const bobStatus: WorkflowStatus = isFirstRound ? 'bob_building' : 'bob_fixing'
      this.setStatus(bobStatus)

      for (const ev of round.bob_phase.events) {
        if (this.aborted) break
        this.emit(ev.agent, ev.message, ev.type)
        await sleep(EVENT_DELAY)
      }

      // Apply diffs and test results to state
      for (const diff of round.bob_phase.diffs) {
        if (!this.state.diffs.find((d) => d.filename === diff.filename && d.after === diff.after)) {
          this.state.diffs.push(diff)
        }
      }
      this.state.test_results.push(round.bob_phase.test_result)
      this.updateMetricsFromTestResult(round.bob_phase.test_result, round.round_number)
      this.notifyState()

      await sleep(EVENT_DELAY)

      if (this.aborted) break

      // ── MYCROSAIFT PHASE ───────────────────────────────────────────────
      this.setStatus('mycrosaift_attacking')

      for (const ev of round.mycrosaift_phase.events) {
        if (this.aborted) break
        this.emit(ev.agent, ev.message, ev.type)
        await sleep(EVENT_DELAY)
      }

      // Merge findings: add new ones, update fixed ones
      for (const finding of round.mycrosaift_phase.findings) {
        const existing = this.state.findings.find((f) => f.id === finding.id)
        if (!existing) {
          this.state.findings.push({ ...finding })
          this.state.metrics.issues_found++
          if (finding.severity === 'CRITICAL' || finding.severity === 'HIGH') {
            this.state.metrics.critical_issues++
          }
        }
      }

      // Mark previously open findings as FIXED if Bob fixed them this round
      // (findings not re-reported by Mycrosaift this round and status is OPEN)
      if (round.round_number > 1) {
        const reportedIds = new Set(round.mycrosaift_phase.findings.map((f) => f.id))
        for (const f of this.state.findings) {
          if (f.status === 'OPEN' && !reportedIds.has(f.id)) {
            f.status = 'FIXED'
            f.round_fixed = round.round_number
            this.state.metrics.issues_fixed++
          }
        }
        // After final round — mark remaining open findings as VERIFIED if no new ones
        if (round.round_number === this.scenario.rounds.length && round.mycrosaift_phase.findings.length === 0) {
          for (const f of this.state.findings) {
            if (f.status === 'FIXED') {
              f.status = 'VERIFIED'
            }
          }
        }
      }

      this.state.metrics.iterations = round.round_number
      this.notifyState()

      await sleep(EVENT_DELAY)

      // ── End of round: check if done ────────────────────────────────────
      if (!round.mycrosaift_phase.has_critical) {
        // No critical issues left — we're done
        break
      }
    }

    if (!this.aborted) {
      // Final state
      this.state.metrics.duration_seconds = Math.round((Date.now() - startTime) / 1000)
      const hasCritical = this.state.findings.some(
        (f) => f.status === 'OPEN' && (f.severity === 'CRITICAL' || f.severity === 'HIGH')
      )
      this.state.final_verdict = hasCritical ? 'FAILED' : 'VALIDATED'
      this.setStatus(hasCritical ? 'failed' : 'validated')

      this.emit('SYSTEM', '─'.repeat(48), 'separator')
      if (!hasCritical) {
        this.emit('SYSTEM', `🏆 IMPLEMENTATION VALIDATED after ${this.state.metrics.iterations} round(s)`, 'success')
      } else {
        this.emit('SYSTEM', `⚠ Workflow ended with unresolved issues`, 'error')
      }
    }

    return { ...this.state }
  }

  abort() {
    this.aborted = true
  }

  reset() {
    this.aborted = true
    this.state = this.initialState()
    _eventCounter = 0
    this.notifyState()
  }

  getState(): WorkflowState {
    return { ...this.state }
  }

  private updateMetricsFromTestResult(result: TestResult, _round: number) {
    this.state.metrics.tests_generated += result.total
    this.state.metrics.tests_passed += result.passed
    this.state.metrics.tests_failed += result.failed
    this.state.metrics.files_changed = this.state.diffs.length
  }
}

export function createOrchestrator(
  scenario: ScenarioScript,
  onEvent: (event: AgentEvent) => void,
  onStateChange: (state: WorkflowState) => void
): WorkflowOrchestrator {
  return new WorkflowOrchestrator(scenario, onEvent, onStateChange)
}
