'use client'

import { useEffect, useRef } from 'react'
import type { AgentEvent } from '@/types'

interface ActivityFeedProps {
  events: AgentEvent[]
}

const AGENT_COLORS: Record<string, string> = {
  BOB: '#00ff88',
  MYCROSAIFT: '#ff3366',
  SYSTEM: '#64748b',
}

const TYPE_PREFIXES: Record<string, string> = {
  success: '✓',
  error: '✗',
  warning: '▲',
  info: '●',
  code: '»',
  separator: '',
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-arena-border">
        <span className="text-xs text-slate-500 tracking-widest uppercase">Live Activity</span>
        <span className="text-xs text-slate-600">{events.length} events</span>
      </div>

      <div
        className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-xs"
        style={{ minHeight: 0 }}
      >
        {events.length === 0 && (
          <div className="text-slate-600 text-center py-8">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-xs tracking-widest">Waiting for workflow to start...</div>
          </div>
        )}

        {events.map((event) => (
          <EventLine key={event.id} event={event} />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function EventLine({ event }: { event: AgentEvent }) {
  const isSeparator = event.type === 'separator'
  const prefix = TYPE_PREFIXES[event.type] ?? '●'
  const agentColor = AGENT_COLORS[event.agent] ?? '#64748b'

  if (isSeparator) {
    return (
      <div className="py-1">
        <div className="border-t border-arena-border opacity-40" />
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 py-0.5 animate-[fade-in_0.3s_ease-out]">
      {/* Timestamp */}
      <span className="text-slate-600 flex-shrink-0 w-[54px]">{event.timestamp}</span>

      {/* Agent badge */}
      <span
        className="flex-shrink-0 w-[84px] font-bold text-right pr-2"
        style={{ color: agentColor }}
      >
        {event.agent}
      </span>

      {/* Prefix icon */}
      <span
        className={`flex-shrink-0 w-3 ${
          event.type === 'success'
            ? 'text-bob'
            : event.type === 'error'
            ? 'text-mycrosaift'
            : event.type === 'warning'
            ? 'text-yellow-400'
            : 'text-slate-600'
        }`}
      >
        {prefix}
      </span>

      {/* Message */}
      <span
        className={`leading-relaxed ${
          event.type === 'success'
            ? 'text-bob'
            : event.type === 'error'
            ? 'text-mycrosaift'
            : event.type === 'warning'
            ? 'text-yellow-300'
            : 'text-slate-300'
        }`}
      >
        {event.message}
      </span>
    </div>
  )
}
