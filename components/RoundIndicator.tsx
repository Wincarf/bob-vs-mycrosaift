'use client'

import type { WorkflowStatus } from '@/types'

interface RoundIndicatorProps {
  currentRound: number
  totalRounds: number
  status: WorkflowStatus
}

const PHASES = ['BUILD', 'BREAK', 'FIX'] as const

function getActivePhase(status: WorkflowStatus): number {
  if (status === 'bob_building') return 0
  if (status === 'mycrosaift_attacking') return 1
  if (status === 'bob_fixing') return 2
  return -1
}

export function RoundIndicator({ currentRound, totalRounds, status }: RoundIndicatorProps) {
  const activePhase = getActivePhase(status)
  const roundLabel =
    status === 'idle'
      ? 'READY'
      : status === 'validated'
      ? 'COMPLETE'
      : status === 'failed'
      ? 'FAILED'
      : `ROUND ${currentRound}`

  return (
    <div className="flex flex-col items-center justify-center px-6 min-w-[140px]">
      {/* VS */}
      <div className="text-4xl font-bold text-slate-600 mb-4 tracking-widest">VS</div>

      {/* Round label */}
      <div
        className={`
          text-sm font-bold tracking-widest px-3 py-1 rounded border mb-4
          ${status === 'validated'
            ? 'text-bob border-bob bg-bob/10'
            : status === 'failed'
            ? 'text-mycrosaift border-mycrosaift bg-mycrosaift/10'
            : 'text-slate-400 border-arena-border'}
        `}
      >
        {roundLabel}
      </div>

      {/* Phase breadcrumb */}
      <div className="flex flex-col gap-1.5 items-center">
        {PHASES.map((phase, i) => {
          const isActive = activePhase === i
          const isPast = status === 'bob_fixing' && i < 2
          return (
            <div key={phase} className="flex flex-col items-center gap-1">
              <span
                className={`
                  text-xs font-mono tracking-widest px-2 py-0.5 rounded
                  ${isActive
                    ? i === 1
                      ? 'bg-mycrosaift/20 text-mycrosaift border border-mycrosaift/40'
                      : 'bg-bob/20 text-bob border border-bob/40'
                    : isPast
                    ? 'text-slate-500'
                    : 'text-slate-700'}
                `}
              >
                {phase}
              </span>
              {i < PHASES.length - 1 && (
                <span className="text-slate-700 text-xs">↓</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Round progress dots */}
      {totalRounds > 0 && (
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  i + 1 < currentRound
                    ? '#00ff88'
                    : i + 1 === currentRound
                    ? '#ffd600'
                    : '#1e1e2e',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
