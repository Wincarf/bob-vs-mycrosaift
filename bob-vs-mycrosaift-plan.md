# Bob vs Mycrosaift — Hackathon MVP Plan

## Overview

Build a polished hackathon web application called **Bob vs Mycrosaift** — an adversarial AI software-engineering workflow demo.

- **Bob** is the Builder Agent: analyzes a repo, writes code, writes tests, fixes bugs.
- **Mycrosaift** is the Breaker Agent: adversarially reviews Bob's output, generates structured findings, creates reproduction tests.
- The two agents iterate in rounds until no critical issues remain.
- The entire workflow is **fully deterministic** — driven by pre-scripted JSON scenario files, not live LLM calls. The LLM integration layer is stubbed with env-var configuration for future swap-in.

### Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Server-Sent Events (SSE)** for real-time activity feed
- **In-memory state** — no database
- **Deterministic scenario scripts** — structured JSON defining all agent actions, diffs, findings, and test results

### Non-goals (MVP)

- Real code execution
- Real file system writes
- Live LLM calls (stubbed for later)
- Persistent history across page reloads
- Multiple repositories

---

## Sub-Task 1 — Project Scaffolding

**Status:** [ ] pending

### Intent
Bootstrap a Next.js 14 + TypeScript + Tailwind project with the correct directory structure for this application.

### Expected Outcomes
- `package.json` exists with all required dependencies
- `tsconfig.json` configured
- `tailwind.config.ts` configured
- App Router structure in place: `app/`, `app/layout.tsx`, `app/page.tsx`
- `components/`, `lib/`, `scenarios/`, `types/` directories created
- Application runs with `npm run dev` showing a blank page

### Todo List
- [ ] Create `package.json` with next, react, react-dom, typescript, tailwindcss, postcss, autoprefixer, lucide-react
- [ ] Create `tsconfig.json`
- [ ] Create `tailwind.config.ts` with dark theme as default
- [ ] Create `postcss.config.js`
- [ ] Create `next.config.ts`
- [ ] Create `app/layout.tsx` with base HTML shell, dark background, IBM Plex Mono font
- [ ] Create `app/globals.css` with Tailwind base + custom CSS variables
- [ ] Create `app/page.tsx` as a placeholder
- [ ] Create directory stubs: `components/`, `lib/`, `scenarios/`, `types/`

### Relevant Context
- Workspace root: `c:\Hackathon\IBM Bob Hackathon`
- Only existing file: `logo.jpg`

---

## Sub-Task 2 — Type Definitions and Core Data Model

**Status:** [ ] pending

### Intent
Define all shared TypeScript types used across the application. These types are the contract between the scenario scripts, the orchestrator, and the UI.

### Expected Outcomes
- `types/index.ts` exports all core types
- Types cover: AgentEvent, Finding, Round, WorkflowState, ScenarioScript, DemoChallenge

### Todo List
- [ ] Define `AgentEvent` — a single timestamped activity log entry (timestamp, agent: "BOB"|"MYCROSAIFT"|"SYSTEM", message, type: "info"|"success"|"error"|"warning")
- [ ] Define `Finding` — a structured bug/vulnerability report (id, category, severity: "CRITICAL"|"HIGH"|"MEDIUM"|"LOW", title, description, affected_file, affected_function, evidence, reproduction_test, recommended_fix, status: "OPEN"|"CONFIRMED"|"FIXED"|"REJECTED"|"VERIFIED")
- [ ] Define `FileDiff` — a simulated code change (filename, before, after, language)
- [ ] Define `TestResult` — outcome of a test run (total, passed, failed, test_names)
- [ ] Define `BobPhase` — what Bob did in a round (events, diffs, test_result, summary)
- [ ] Define `MycrosaiftPhase` — what Mycrosaift found in a round (events, findings, reproduction_tests_created, summary)
- [ ] Define `Round` — one full iteration (round_number, bob_phase, mycrosaift_phase)
- [ ] Define `WorkflowState` — the full in-memory state (status, task, rounds, metrics, final_verdict)
- [ ] Define `ScenarioScript` — the full deterministic script (challenge_id, challenge_name, description, rounds array)
- [ ] Define `DemoChallenge` — a selectable demo scenario (id, name, description, script_key)
- [ ] Define `Metrics` — aggregated numbers (iterations, issues_found, issues_fixed, tests_generated, tests_passed, critical_issues, files_changed)

---

## Sub-Task 3 — Deterministic Scenario Scripts

**Status:** [ ] pending

### Intent
Create at least one polished end-to-end deterministic scenario that drives the entire demo without requiring any LLM call. This is the most important content asset for the hackathon.

### Expected Outcomes
- `scenarios/password-reset.ts` contains a complete 3-round scenario for "Implement password reset endpoint"
- The scenario contains realistic simulated file diffs, test output, and structured findings
- At least 4 findings across rounds (1 CRITICAL security issue, 1 HIGH, 1 MEDIUM, 1 LOW)
- Each finding has full evidence, reproduction test, and recommended fix
- Round 1: Bob builds, Mycrosaift finds 3 issues
- Round 2: Bob fixes 3 issues, Mycrosaift finds 1 issue
- Round 3: Bob fixes final issue, Mycrosaift finds 0 critical issues → VALIDATED
- `scenarios/index.ts` exports all scenarios and the `DemoChallenge[]` list

### Todo List
- [ ] Create `scenarios/password-reset.ts` with full 3-round script
  - Round 1 Bob phase: events simulating repo analysis, planning, implementing `POST /auth/reset-password`, writing 4 unit tests, running tests (all pass)
  - Round 1 Bob diffs: show realistic TypeScript/Node.js code for a password reset endpoint
  - Round 1 Mycrosaift phase: events simulating adversarial analysis, finding 3 issues (token reuse CRITICAL, missing expiration check HIGH, error message leaks detail LOW)
  - Each finding fully populated per the Finding type
  - Round 2 Bob phase: fixes token invalidation, adds expiration, sanitizes errors; 3 new tests pass
  - Round 2 Mycrosaift phase: confirms 3 fixes, finds 1 new issue (rate limiting missing MEDIUM)
  - Round 3 Bob phase: adds rate limiting, 2 new tests
  - Round 3 Mycrosaift phase: confirms fix, finds 0 critical issues
- [ ] Create `scenarios/file-upload.ts` — shorter 2-round script for "Add file upload endpoint"
- [ ] Create `scenarios/index.ts` that exports `SCENARIOS` map and `DEMO_CHALLENGES` array

### Relevant Context
- The scenario drives everything the UI shows — invest time making the content realistic and impressive
- Simulated TypeScript file diffs should look like real auth service code

---

## Sub-Task 4 — Orchestrator Engine (lib/orchestrator)

**Status:** [ ] pending

### Intent
Build the in-memory workflow engine that reads a scenario script and emits events in real time. This is the core "brains" of the application — it controls the loop, maintains state, and streams progress.

### Expected Outcomes
- `lib/orchestrator.ts` exports a `WorkflowOrchestrator` class
- Orchestrator accepts a scenario and emits events via a callback
- Supports `start()`, `pause()`, `reset()` lifecycle methods
- Maintains `WorkflowState` throughout the run
- Simulates realistic delay between events (configurable speed)
- After all rounds complete, sets final verdict and metrics

### Todo List
- [ ] Create `lib/orchestrator.ts` with `WorkflowOrchestrator` class
- [ ] Constructor: accepts `ScenarioScript`, `onEvent: (event) => void`, `onStateChange: (state) => void`
- [ ] `start()`: begins stepping through scenario rounds; each event is emitted with a configurable delay (default 600–1200ms simulating real work)
- [ ] `reset()`: clears state back to initial
- [ ] State machine: `idle` → `bob_building` → `mycrosaift_attacking` → `bob_fixing` → (loop) → `validated` | `failed`
- [ ] After final round: compute and attach `Metrics` to `WorkflowState`
- [ ] Export `createOrchestrator(challengeId)` factory function

---

## Sub-Task 5 — SSE API Route

**Status:** [ ] pending

### Intent
Create a Next.js API route that runs the orchestrator and streams events to the browser via Server-Sent Events. This gives the UI real-time agent updates without WebSocket complexity.

### Expected Outcomes
- `app/api/workflow/stream/route.ts` accepts `GET ?challenge=password-reset`
- Returns a `text/event-stream` response
- Streams `AgentEvent` objects as JSON lines until the workflow completes
- Streams a final `WorkflowState` snapshot as the last event
- Handles client disconnect gracefully
- A second route `app/api/workflow/state/route.ts` returns current state as JSON (for polling fallback)

### Todo List
- [ ] Create `app/api/workflow/stream/route.ts` using the Next.js route handler pattern
- [ ] Instantiate the orchestrator from the challenge param
- [ ] Use `ReadableStream` to write SSE-formatted events
- [ ] Each event: `data: {"type":"event","payload":<AgentEvent>}\n\n`
- [ ] Final event: `data: {"type":"state","payload":<WorkflowState>}\n\n`
- [ ] Create `lib/sse.ts` helper to format SSE messages
- [ ] Handle abort signal to cancel the stream on client disconnect

---

## Sub-Task 6 — Main Arena UI Layout

**Status:** [ ] pending

### Intent
Build the primary page shell: the "AI Engineering Arena" with the BOB vs MYCROSAIFT two-panel header, round indicator, and overall layout regions. This is the visual identity of the product.

### Expected Outcomes
- `app/page.tsx` renders the full arena layout
- Top: "BOB VS MYCROSAIFT / AI SOFTWARE ENGINEERING ARENA" title
- Two large agent panels side-by-side (BOB left, MYCROSAIFT right) with "VS" between them
- Each panel shows agent name, role subtitle, status indicator (idle/building/attacking/fixed), and current action message
- Round indicator between panels shows "ROUND N — BUILD → BREAK → FIX"
- Task input field at top with "START" button
- Layout is responsive and dark-themed
- Uses IBM Plex Mono or similar monospace font
- Bob panel accent color: green (#00ff88 or similar)
- Mycrosaift panel accent color: red (#ff3333 or similar)

### Todo List
- [ ] Create `components/AgentPanel.tsx` — the large agent status card
  - Props: agent name, role, status, current message, accent color
  - Status badge: animated pulse for active states
- [ ] Create `components/ArenaHeader.tsx` — title + VS layout
- [ ] Create `components/RoundIndicator.tsx` — "ROUND N" + phase breadcrumbs
- [ ] Create `components/TaskInput.tsx` — input field + challenge selector + start button
- [ ] Wire up `app/page.tsx` with all layout components
- [ ] Challenge selector shows the DEMO_CHALLENGES list as quick-pick buttons

---

## Sub-Task 7 — Activity Feed Component

**Status:** [ ] pending

### Intent
Build the real-time activity log that streams agent events as they happen — the most important "proof of work" element for judges.

### Expected Outcomes
- `components/ActivityFeed.tsx` renders a scrolling terminal-style log
- Each entry shows: timestamp, agent badge (BOB green / MYCROSAIFT red / SYSTEM gray), message text
- New entries animate in from the bottom
- Feed auto-scrolls to the latest entry
- Different entry types have different visual treatments (success ✓, error ✗, info ●, warning ▲)
- Feed can be cleared/reset

### Todo List
- [ ] Create `components/ActivityFeed.tsx`
- [ ] Accept `events: AgentEvent[]` prop
- [ ] Render as a dark terminal box with monospace font
- [ ] Color-code agent badges
- [ ] Use `useEffect` + `ref` to auto-scroll on new entries
- [ ] Animate new entries with a CSS fade-in

---

## Sub-Task 8 — Findings Panel Component

**Status:** [ ] pending

### Intent
Build the findings display — the structured issue cards that Mycrosaift generates. This is the core "evidence-based" UI that differentiates the product from a chatbot.

### Expected Outcomes
- `components/FindingsPanel.tsx` renders all findings across rounds
- Each finding is an expandable card showing all fields (category, severity, description, evidence, reproduction test, fix)
- Severity is color-coded: CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=blue
- Status badge shows OPEN / CONFIRMED / FIXED / VERIFIED
- Findings animate in when Mycrosaift discovers them
- When Bob fixes an issue, its status badge updates to FIXED

### Todo List
- [ ] Create `components/FindingCard.tsx` — single finding display
  - Collapsed view: severity badge, title, status badge
  - Expanded view: all fields in structured layout with code blocks for evidence and reproduction test
- [ ] Create `components/FindingsPanel.tsx` — groups findings by round
- [ ] Accept `findings: Finding[]` and `currentRound: number` props
- [ ] Add expand/collapse toggle per card
- [ ] Animate status transitions

---

## Sub-Task 9 — Diff Viewer Component

**Status:** [ ] pending

### Intent
Show the simulated code diffs that Bob produces — makes the "Bob is actually coding" narrative concrete and credible.

### Expected Outcomes
- `components/DiffViewer.tsx` renders before/after code diffs in a side-by-side or unified format
- Removed lines shown in red with `-` prefix
- Added lines shown in green with `+` prefix
- Filename shown in a header bar
- Syntax-highlighted (or at minimum monospaced code font)
- Scrollable for long diffs

### Todo List
- [ ] Create `components/DiffViewer.tsx`
- [ ] Accept `diffs: FileDiff[]` prop
- [ ] Render unified diff format (not side-by-side, simpler for MVP)
- [ ] Color removed lines red, added lines green, context lines neutral
- [ ] Show filename in a tab-style header
- [ ] Multiple diffs shown as multiple tabs or stacked cards

---

## Sub-Task 10 — Metrics and Final Verdict Screen

**Status:** [ ] pending

### Intent
Build the scoreboard and final "IMPLEMENTATION VALIDATED" victory screen that appears when the workflow completes.

### Expected Outcomes
- `components/MetricsBar.tsx` shows live counters during the workflow (iterations, issues found/fixed, tests, files changed)
- `components/FinalVerdict.tsx` renders the full victory/failure screen
- Victory screen shows the bordered box from the spec with all metrics
- Uses a satisfying animation on transition (e.g. green glow, typewriter reveal)

### Todo List
- [ ] Create `components/MetricsBar.tsx` — horizontal bar of live metric counters
- [ ] Create `components/FinalVerdict.tsx`
  - Full-screen overlay or main content replacement
  - "IMPLEMENTATION VALIDATED" in large monospaced text
  - Bordered box with all metrics
  - "BOB builds. MYCROSAIFT breaks. Software gets better." tagline
  - "Run Again" / "Try Another Challenge" buttons
- [ ] Animate metrics counting up when final state arrives

---

## Sub-Task 11 — Workflow State Hook and SSE Client

**Status:** [ ] pending

### Intent
Build the React state management layer that connects the SSE stream to the UI. This is the client-side orchestration that makes everything reactive.

### Expected Outcomes
- `lib/useWorkflow.ts` — custom React hook
- Hook manages: workflow status, current round, all events, all findings, all diffs, metrics
- Connects to the SSE API route, parses events, updates state
- Exposes `start(challengeId)`, `reset()` functions
- Handles connection errors gracefully (shows error state, allows retry)
- Exposes loading/running/complete/error states

### Todo List
- [ ] Create `lib/useWorkflow.ts`
- [ ] Use `EventSource` or `fetch` with streaming to consume the SSE route
- [ ] On each incoming event, append to `events[]` and update derived state
- [ ] On final state event, populate metrics and trigger final verdict
- [ ] Handle `onerror`: set error state, do not crash
- [ ] `reset()` clears all state and closes any open connection
- [ ] Export typed return value

---

## Sub-Task 12 — Wire Everything Together

**Status:** [ ] pending

### Intent
Connect all components and hooks in `app/page.tsx` so the full end-to-end demo works: user selects challenge → clicks start → watches live feed → sees findings → rounds complete → final verdict appears.

### Expected Outcomes
- Full end-to-end demo works for the "password-reset" scenario
- Agent panels update status as workflow phases change
- Activity feed streams in real time
- Findings appear as Mycrosaift discovers them, update to FIXED as Bob resolves them
- Diff viewer shows Bob's code changes per round
- Metrics bar counts up throughout
- Final verdict screen appears at end with animation
- "Reset" button works cleanly
- Error state is handled (shows error message + retry button)

### Todo List
- [ ] Update `app/page.tsx` to use `useWorkflow` hook
- [ ] Pass workflow state down to all child components
- [ ] Show/hide DiffViewer when Bob's phase completes (collapsible)
- [ ] Show/hide FindingsPanel when Mycrosaift's phase produces findings
- [ ] Conditionally render FinalVerdict overlay when status is "validated"
- [ ] Test full scenario end-to-end in browser
- [ ] Confirm demo reset works and can be rerun

---

## Sub-Task 13 — Polish and Demo Readiness

**Status:** [ ] pending

### Intent
Final pass to make the demo presentation-ready: timing feel, visual consistency, logo integration, and demo instructions.

### Expected Outcomes
- `logo.jpg` integrated in the header
- Timing of simulated events feels natural (not too fast, not too slow)
- All severity colors, badges, and status indicators are consistent
- README.md explains how to run the project and start the demo
- The "password-reset" scenario runs cleanly end-to-end in ~90 seconds

### Todo List
- [ ] Add `logo.jpg` to `ArenaHeader`
- [ ] Tune event delay timing in `lib/orchestrator.ts`
- [ ] Add keyboard shortcut: press Enter in task input to start
- [ ] Create `README.md` with setup and demo instructions
- [ ] Final visual QA pass: check padding, font sizes, color contrast
- [ ] Verify the full scenario runs without errors in dev mode

---

## Architecture Diagram

```
app/page.tsx
  └── useWorkflow (lib/useWorkflow.ts)
        └── SSE client → /api/workflow/stream
                            └── WorkflowOrchestrator (lib/orchestrator.ts)
                                  └── ScenarioScript (scenarios/password-reset.ts)

Components:
  ArenaHeader
  AgentPanel (BOB) + AgentPanel (MYCROSAIFT)
  RoundIndicator
  TaskInput
  ActivityFeed
  FindingsPanel → FindingCard[]
  DiffViewer
  MetricsBar
  FinalVerdict
```

## File Map

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── workflow/
│           └── stream/
│               └── route.ts
├── components/
│   ├── AgentPanel.tsx
│   ├── ArenaHeader.tsx
│   ├── RoundIndicator.tsx
│   ├── TaskInput.tsx
│   ├── ActivityFeed.tsx
│   ├── FindingCard.tsx
│   ├── FindingsPanel.tsx
│   ├── DiffViewer.tsx
│   ├── MetricsBar.tsx
│   └── FinalVerdict.tsx
├── lib/
│   ├── orchestrator.ts
│   ├── sse.ts
│   └── useWorkflow.ts
├── scenarios/
│   ├── index.ts
│   ├── password-reset.ts
│   └── file-upload.ts
├── types/
│   └── index.ts
├── public/
│   └── logo.jpg
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```
