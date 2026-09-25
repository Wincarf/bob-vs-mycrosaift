'use client'

import { useState } from 'react'
import type { Finding, Severity } from '@/types'

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string }> = {
  CRITICAL: { label: 'CRITICAL', color: '#ff1744', bg: 'rgba(255,23,68,0.1)', border: 'rgba(255,23,68,0.3)' },
  HIGH:     { label: 'HIGH',     color: '#ff6d00', bg: 'rgba(255,109,0,0.1)', border: 'rgba(255,109,0,0.3)' },
  MEDIUM:   { label: 'MEDIUM',   color: '#ffd600', bg: 'rgba(255,214,0,0.1)', border: 'rgba(255,214,0,0.3)' },
  LOW:      { label: 'LOW',      color: '#29b6f6', bg: 'rgba(41,182,246,0.1)', border: 'rgba(41,182,246,0.3)' },
  INFO:     { label: 'INFO',     color: '#78909c', bg: 'rgba(120,144,156,0.1)', border: 'rgba(120,144,156,0.3)' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN:      { label: 'OPEN',      color: '#ff6d00' },
  CONFIRMED: { label: 'CONFIRMED', color: '#ff3366' },
  FIXED:     { label: 'FIXED',     color: '#00ff88' },
  VERIFIED:  { label: 'VERIFIED',  color: '#00ff88' },
  REJECTED:  { label: 'REJECTED',  color: '#64748b' },
}

export function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false)
  const sev = SEVERITY_CONFIG[finding.severity]
  const stat = STATUS_CONFIG[finding.status] ?? STATUS_CONFIG.OPEN

  return (
    <div
      className="border rounded-lg overflow-hidden transition-all duration-300 animate-[fade-in_0.4s_ease-out]"
      style={{ borderColor: sev.border, backgroundColor: sev.bg }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        {/* Severity badge */}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 tracking-widest"
          style={{ color: sev.color, borderColor: sev.border, backgroundColor: 'transparent' }}
        >
          {sev.label}
        </span>

        {/* Finding ID */}
        <span className="text-slate-500 text-xs flex-shrink-0">{finding.id}</span>

        {/* Title */}
        <span className="text-white text-sm font-mono flex-1 truncate">{finding.title}</span>

        {/* Category */}
        <span className="text-slate-500 text-xs hidden sm:block flex-shrink-0">{finding.category}</span>

        {/* Status */}
        <span
          className="text-xs font-bold flex-shrink-0 tracking-wider"
          style={{ color: stat.color }}
        >
          {stat.label}
        </span>

        {/* Expand arrow */}
        <span className="text-slate-600 text-xs flex-shrink-0 ml-1">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 space-y-4 text-xs font-mono">
          {/* Description */}
          <div className="pt-3">
            <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-1">Description</div>
            <p className="text-slate-300 leading-relaxed">{finding.description}</p>
          </div>

          {/* Affected */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-1">File</div>
              <code className="text-bob/80 bg-arena-bg px-1.5 py-0.5 rounded text-[11px]">
                {finding.affected_file}
              </code>
            </div>
            <div>
              <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-1">Function</div>
              <code className="text-bob/80 bg-arena-bg px-1.5 py-0.5 rounded text-[11px]">
                {finding.affected_function}
              </code>
            </div>
          </div>

          {/* Evidence */}
          <div>
            <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-1">Evidence</div>
            <pre className="bg-arena-bg border border-arena-border rounded p-3 text-slate-300 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {finding.evidence}
            </pre>
          </div>

          {/* Reproduction test */}
          {finding.reproduction_test && (
            <div>
              <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-1">
                Reproduction Test
              </div>
              <pre className="bg-arena-bg border border-mycrosaift/20 rounded p-3 text-slate-300 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {finding.reproduction_test}
              </pre>
            </div>
          )}

          {/* Recommended fix */}
          <div>
            <div className="text-slate-500 uppercase tracking-widest text-[10px] mb-1">
              Recommended Fix
            </div>
            <pre className="bg-arena-bg border border-bob/20 rounded p-3 text-bob/80 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {finding.recommended_fix}
            </pre>
          </div>

          {/* Round info */}
          <div className="flex gap-4 text-slate-600 text-[10px]">
            <span>Found in Round {finding.round_discovered}</span>
            {finding.round_fixed && <span>Fixed in Round {finding.round_fixed}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export function FindingsPanel({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 font-mono text-xs">
        <div className="text-2xl mb-2">🔍</div>
        <div className="tracking-widest">No findings yet...</div>
      </div>
    )
  }

  const open = findings.filter((f) => f.status === 'OPEN' || f.status === 'CONFIRMED')
  const fixed = findings.filter((f) => f.status === 'FIXED' || f.status === 'VERIFIED')

  return (
    <div className="space-y-4">
      {open.length > 0 && (
        <section>
          <div className="text-xs text-mycrosaift tracking-widest uppercase mb-2 font-bold">
            Open Issues ({open.length})
          </div>
          <div className="space-y-2">
            {open.map((f) => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </div>
        </section>
      )}

      {fixed.length > 0 && (
        <section>
          <div className="text-xs text-bob tracking-widest uppercase mb-2 font-bold">
            Fixed & Verified ({fixed.length})
          </div>
          <div className="space-y-2">
            {fixed.map((f) => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
