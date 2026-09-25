'use client'

import type { WorkflowStatus } from '@/types'

interface AgentPanelProps {
  agent: 'BOB' | 'MYCROSAIFT'
  status: WorkflowStatus
  currentMessage: string
  isActive: boolean
}

const BOB_STATUSES: WorkflowStatus[] = ['bob_building', 'bob_fixing']
const MYCROSAIFT_STATUSES: WorkflowStatus[] = ['mycrosaift_attacking']

function getAgentStatus(
  agent: 'BOB' | 'MYCROSAIFT',
  status: WorkflowStatus
): { label: string; color: string } {
  if (status === 'idle') return { label: 'STANDBY', color: 'text-slate-500' }
  if (status === 'error') return { label: 'ERROR', color: 'text-red-400' }
  if (status === 'validated' || status === 'failed') {
    return agent === 'BOB'
      ? { label: status === 'validated' ? 'VALIDATED ✓' : 'DONE', color: 'text-bob' }
      : { label: status === 'validated' ? 'CLEARED ✓' : 'ISSUES REMAIN', color: status === 'validated' ? 'text-bob' : 'text-mycrosaift' }
  }

  if (agent === 'BOB') {
    if (BOB_STATUSES.includes(status)) {
      return { label: status === 'bob_building' ? 'BUILDING...' : 'FIXING...', color: 'text-bob' }
    }
    return { label: 'WAITING', color: 'text-slate-400' }
  } else {
    if (MYCROSAIFT_STATUSES.includes(status)) {
      return { label: 'ATTACKING...', color: 'text-mycrosaift' }
    }
    return { label: 'WAITING', color: 'text-slate-400' }
  }
}

export function AgentPanel({ agent, status, currentMessage, isActive }: AgentPanelProps) {
  const isBob = agent === 'BOB'
  const accent = isBob ? 'bob' : 'mycrosaift'
  const accentColor = isBob ? '#00ff88' : '#ff3366'
  const glowClass = isBob
    ? isActive ? 'bob-glow-active' : 'bob-glow'
    : isActive ? 'mycrosaift-glow-active' : 'mycrosaift-glow'

  const { label, color } = getAgentStatus(agent, status)

  return (
    <div
      className={`
        flex-1 border rounded-lg p-6 transition-all duration-500
        bg-arena-card border-arena-border
        ${glowClass}
      `}
    >
      {/* Agent name */}
      <div className="text-center mb-6">
        <div
          className="text-3xl font-bold tracking-widest mb-1"
          style={{ color: accentColor }}
        >
          {agent}
        </div>
        <div className="text-xs text-slate-500 tracking-widest uppercase">
          {isBob ? 'Builder AI' : 'Breaker AI'}
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span
          className={`
            w-2.5 h-2.5 rounded-full inline-block flex-shrink-0
            ${isActive ? (isBob ? 'animate-[pulse-green_2s_ease-in-out_infinite]' : 'animate-[pulse-red_2s_ease-in-out_infinite]') : ''}
          `}
          style={{
            backgroundColor: isActive ? accentColor : '#334155',
          }}
        />
        <span className={`text-sm font-mono font-bold tracking-widest ${color}`}>
          {label}
        </span>
      </div>

      {/* Current message */}
      <div
        className="text-xs text-slate-400 font-mono min-h-[3rem] text-center leading-relaxed px-2"
      >
        {currentMessage || (isActive ? '...' : '—')}
      </div>

      {/* Role description */}
      <div className="mt-6 pt-4 border-t border-arena-border">
        <div className="text-xs text-slate-600 text-center leading-relaxed">
          {isBob
            ? 'Analyzes → Plans → Implements → Tests → Fixes'
            : 'Probes → Attacks → Confirms → Validates'}
        </div>
      </div>
    </div>
  )
}
