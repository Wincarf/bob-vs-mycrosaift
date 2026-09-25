// ─── Agent identity ───────────────────────────────────────────────────────────

export type AgentName = 'BOB' | 'MYCROSAIFT' | 'SYSTEM'

export type EventType = 'info' | 'success' | 'error' | 'warning' | 'code' | 'separator'

export interface AgentEvent {
  id: string
  timestamp: string        // HH:MM:SS
  agent: AgentName
  message: string
  type: EventType
}

// ─── Findings ─────────────────────────────────────────────────────────────────

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export type FindingStatus = 'OPEN' | 'CONFIRMED' | 'FIXED' | 'REJECTED' | 'VERIFIED'

export type FindingCategory =
  | 'Security'
  | 'Functional'
  | 'Testing'
  | 'Reliability'
  | 'Architecture'
  | 'Performance'

export interface Finding {
  id: string                      // e.g. "FINDING-01"
  round_discovered: number
  category: FindingCategory
  severity: Severity
  title: string
  description: string
  affected_file: string
  affected_function: string
  evidence: string
  reproduction_test: string
  recommended_fix: string
  status: FindingStatus
  round_fixed?: number
}

// ─── Code diffs ───────────────────────────────────────────────────────────────

export interface FileDiff {
  filename: string
  language: string
  before: string
  after: string
  description: string
}

// ─── Test results ─────────────────────────────────────────────────────────────

export interface TestCase {
  name: string
  status: 'pass' | 'fail' | 'skip'
  duration_ms: number
  error?: string
}

export interface TestResult {
  total: number
  passed: number
  failed: number
  skipped: number
  duration_ms: number
  test_cases: TestCase[]
}

// ─── Per-round phases ─────────────────────────────────────────────────────────

export interface BobPhase {
  events: Omit<AgentEvent, 'id' | 'timestamp'>[]
  diffs: FileDiff[]
  test_result: TestResult
  summary: string
}

export interface MycrosaiftPhase {
  events: Omit<AgentEvent, 'id' | 'timestamp'>[]
  findings: Finding[]
  reproduction_tests_created: string[]
  summary: string
  has_critical: boolean
}

export interface Round {
  round_number: number
  bob_phase: BobPhase
  mycrosaift_phase: MycrosaiftPhase
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface Metrics {
  iterations: number
  issues_found: number
  issues_fixed: number
  tests_generated: number
  tests_passed: number
  tests_failed: number
  critical_issues: number
  files_changed: number
  duration_seconds: number
}

// ─── Workflow state ───────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'idle'
  | 'bob_building'
  | 'mycrosaift_attacking'
  | 'bob_fixing'
  | 'validated'
  | 'failed'
  | 'error'

export interface WorkflowState {
  status: WorkflowStatus
  task: string
  challenge_id: string
  current_round: number
  total_rounds: number
  events: AgentEvent[]
  findings: Finding[]
  diffs: FileDiff[]
  test_results: TestResult[]
  metrics: Metrics
  final_verdict?: 'VALIDATED' | 'FAILED'
  error?: string
}

// ─── Scenario script (deterministic) ─────────────────────────────────────────

export interface ScenarioScript {
  challenge_id: string
  challenge_name: string
  task_description: string
  rounds: Round[]
}

// ─── Demo challenge picker ────────────────────────────────────────────────────

export interface DemoChallenge {
  id: string
  name: string
  description: string
  script_key: string
  tag: string
}
