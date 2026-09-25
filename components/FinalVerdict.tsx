'use client'

import type { Metrics, WorkflowState } from '@/types'

interface FinalVerdictProps {
  state: WorkflowState
  onReset: () => void
  onRunAgain: () => void
}

export function FinalVerdict({ state, onReset, onRunAgain }: FinalVerdictProps) {
  const isValidated = state.final_verdict === 'VALIDATED'
  const m = state.metrics

  return (
    <div className="fixed inset-0 bg-arena-bg/95 backdrop-blur-sm flex items-center justify-center z-50 animate-[fade-in_0.5s_ease-out]">
      <div className="max-w-lg w-full mx-4">
        {/* Main box */}
        <div
          className={`
            border-2 rounded-xl p-8 text-center font-mono
            ${isValidated
              ? 'border-bob bg-bob/5 validated-pulse'
              : 'border-mycrosaift bg-mycrosaift/5'}
          `}
        >
          {/* Status line */}
          <div
            className={`text-2xl font-bold tracking-widest mb-6 ${
              isValidated ? 'text-bob' : 'text-mycrosaift'
            }`}
          >
            {isValidated ? '🏆 IMPLEMENTATION VALIDATED' : '⚠ VALIDATION FAILED'}
          </div>

          {/* Agents */}
          <div className="flex items-center justify-center gap-8 mb-8 text-sm">
            <div className="text-center">
              <div className="text-bob font-bold text-lg tracking-widest">BOB</div>
              <div className="text-slate-500 text-xs tracking-widest uppercase">Builder</div>
            </div>
            <div className="text-slate-500 font-bold text-xl">vs</div>
            <div className="text-center">
              <div className="text-mycrosaift font-bold text-lg tracking-widest">MYCROSAIFT</div>
              <div className="text-slate-500 text-xs tracking-widest uppercase">Breaker</div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
            <MetricRow label="Rounds" value={m.iterations} />
            <MetricRow label="Issues Found" value={m.issues_found} valueColor={m.issues_found > 0 ? '#ff6d00' : undefined} />
            <MetricRow label="Issues Fixed" value={m.issues_fixed} valueColor={m.issues_fixed > 0 ? '#00ff88' : undefined} />
            <MetricRow label="Tests Generated" value={m.tests_generated} />
            <MetricRow label="Tests Passing" value={m.tests_passed} valueColor={m.tests_passed > 0 ? '#00ff88' : undefined} />
            <MetricRow
              label="Critical Issues"
              value={m.critical_issues}
              valueColor={m.critical_issues === 0 ? '#00ff88' : '#ff1744'}
            />
          </div>

          {/* Final status */}
          <div
            className={`
              text-xs tracking-widest uppercase border rounded px-4 py-2 mb-8 inline-block
              ${isValidated
                ? 'border-bob/40 text-bob bg-bob/10'
                : 'border-mycrosaift/40 text-mycrosaift bg-mycrosaift/10'}
            `}
          >
            Final Status: {state.final_verdict}
          </div>

          {/* Tagline */}
          <div className="text-slate-500 text-xs mb-8 italic">
            Bob builds. Mycrosaift breaks. Software gets better.
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onRunAgain}
              className="
                px-5 py-2.5 text-sm font-mono tracking-widest rounded border
                border-bob/40 text-bob hover:bg-bob/10 transition-colors
              "
            >
              ↺ Run Again
            </button>
            <button
              onClick={onReset}
              className="
                px-5 py-2.5 text-sm font-mono tracking-widest rounded border
                border-arena-border text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors
              "
            >
              ← New Challenge
            </button>
          </div>
        </div>

        {/* IBM Bob credit */}
        <div className="text-center mt-4 text-xs text-slate-600">
          Powered by IBM Bob 2.0 · Hackathon Demo
        </div>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: number
  valueColor?: string
}) {
  return (
    <div className="flex justify-between items-center border-b border-arena-border pb-2">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="font-bold tabular-nums" style={{ color: valueColor ?? '#e2e8f0' }}>
        {value}
      </span>
    </div>
  )
}
