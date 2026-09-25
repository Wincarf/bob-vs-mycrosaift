'use client'

import type { DemoChallenge, WorkflowStatus } from '@/types'
import { DEMO_CHALLENGES } from '@/scenarios'

interface TaskInputProps {
  status: WorkflowStatus
  onStart: (challengeId: string) => void
  onReset: () => void
}

export function TaskInput({ status, onStart, onReset }: TaskInputProps) {
  const isRunning = status === 'bob_building' || status === 'mycrosaift_attacking' || status === 'bob_fixing'
  const isDone = status === 'validated' || status === 'failed'

  return (
    <div className="bg-arena-surface border border-arena-border rounded-lg p-5">
      <div className="mb-3">
        <span className="text-xs text-slate-500 tracking-widest uppercase">
          Select Demo Challenge
        </span>
      </div>

      {/* Challenge cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {DEMO_CHALLENGES.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            disabled={isRunning}
            onSelect={() => onStart(challenge.id)}
          />
        ))}
      </div>

      {/* Reset button when done */}
      {isDone && (
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="
              px-6 py-2.5 text-sm font-mono tracking-widest
              border border-arena-border text-slate-400
              hover:border-bob hover:text-bob
              rounded transition-all duration-200
            "
          >
            ↺ RESET DEMO
          </button>
        </div>
      )}

      {/* Running indicator */}
      {isRunning && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-bob animate-pulse" />
          Workflow in progress... Please wait
        </div>
      )}
    </div>
  )
}

function ChallengeCard({
  challenge,
  disabled,
  onSelect,
}: {
  challenge: DemoChallenge
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        text-left p-4 border rounded-lg transition-all duration-200 group
        ${disabled
          ? 'border-arena-border opacity-40 cursor-not-allowed'
          : 'border-arena-border hover:border-bob/50 hover:bg-bob/5 cursor-pointer'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-sm font-bold text-white font-mono">{challenge.name}</span>
        <span
          className={`
            text-[10px] px-1.5 py-0.5 rounded tracking-widest flex-shrink-0
            ${challenge.tag === 'FEATURED'
              ? 'bg-bob/20 text-bob border border-bob/30'
              : 'bg-mycrosaift/20 text-mycrosaift border border-mycrosaift/30'}
          `}
        >
          {challenge.tag}
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{challenge.description}</p>
      {!disabled && (
        <div className="mt-2 text-xs text-bob opacity-0 group-hover:opacity-100 transition-opacity">
          → Run demo
        </div>
      )}
    </button>
  )
}
