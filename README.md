# Bob vs Mycrosaift
## AI Software Engineering Arena

> **Bob builds. Mycrosaift breaks. Software gets better.**

A hackathon MVP demonstrating an adversarial AI software-development workflow built for the **IBM Bob 2.0 Hackathon**.

---

## What it does

**Bob** is the Builder Agent — it analyzes a codebase, plans an implementation, writes code, generates tests, and fixes bugs.

**Mycrosaift** is the Breaker Agent — it adversarially attacks Bob's implementation, finds security vulnerabilities, generates reproduction tests, and confirms every finding with evidence.

The two agents iterate in rounds until the implementation passes adversarial review.

```
Developer Task
      ↓
     BOB  —  builds implementation
      ↓
  MYCROSAIFT  —  finds bugs & vulnerabilities
      ↓
     BOB  —  fixes issues
      ↓
  MYCROSAIFT  —  validates fixes
      ↓
   IMPLEMENTATION VALIDATED  🏆
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Click **"Password Reset"** or **"File Upload API"** to run the featured demo scenario.

---

## Demo Scenarios

### 🔐 Password Reset (Featured)
3 rounds. 4 findings:
- `CRITICAL` — Token reuse after successful password reset
- `HIGH` — No rate limiting on forgot-password endpoint
- `LOW` — Internal error messages leaked to client
- `MEDIUM` — No password complexity validation

Watch Bob fix each issue and Mycrosaift verify the fixes.

### 📁 File Upload API
2 rounds. 2 findings:
- `CRITICAL` — Path traversal via unsanitized original filename
- `HIGH` — MIME type spoofing (client-controlled Content-Type)

---

## Architecture

```
app/page.tsx (React Client)
  └── useWorkflow hook  (lib/useWorkflow.ts)
        └── fetch SSE stream
              └── /api/workflow/stream  (app/api/workflow/stream/route.ts)
                    └── WorkflowOrchestrator  (lib/orchestrator.ts)
                          └── ScenarioScript  (scenarios/)
```

### Key files

| Path | Purpose |
|------|---------|
| `scenarios/password-reset.ts` | Full 3-round deterministic demo script |
| `scenarios/file-upload.ts` | 2-round file upload demo script |
| `lib/orchestrator.ts` | Workflow state machine — drives the agent loop |
| `lib/useWorkflow.ts` | React hook — connects SSE stream to UI state |
| `app/api/workflow/stream/route.ts` | SSE streaming API route |
| `components/AgentPanel.tsx` | Bob / Mycrosaift status cards |
| `components/ActivityFeed.tsx` | Real-time terminal-style event log |
| `components/FindingsPanel.tsx` | Evidence-based issue cards |
| `components/DiffViewer.tsx` | Code diff display |
| `components/FinalVerdict.tsx` | Animated validation result screen |
| `types/index.ts` | All shared TypeScript types |

---

## Adding a New Scenario

1. Create `scenarios/my-scenario.ts` implementing the `ScenarioScript` type
2. Add it to `scenarios/index.ts` in the `SCENARIOS` map
3. Add a `DemoChallenge` entry to `DEMO_CHALLENGES`

The scenario defines every agent event, code diff, finding, and test result — no live model calls needed.

---

## Production Build

```bash
npm run build
npm start
```

---

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** — dark arena theme
- **Server-Sent Events** — real-time agent streaming
- **Deterministic scenario scripts** — zero LLM dependency for demo

---

*IBM Bob 2.0 Hackathon · 2026*
