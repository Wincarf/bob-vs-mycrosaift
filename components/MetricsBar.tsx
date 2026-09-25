'use client'

import type { Metrics } from '@/types'

interface MetricsBarProps {
  metrics: Metrics
}

interface MetricItem {
  label: string
  value: number | string
  color?: string
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  const items: MetricItem[] = [
    { label: 'Iterations', value: metrics.iterations },
    { label: 'Issues Found', value: metrics.issues_found, color: metrics.issues_found > 0 ? '#ff6d00' : undefined },
    { label: 'Issues Fixed', value: metrics.issues_fixed, color: metrics.issues_fixed > 0 ? '#00ff88' : undefined },
    { label: 'Tests', value: metrics.tests_generated },
    { label: 'Passing', value: metrics.tests_passed, color: metrics.tests_passed > 0 ? '#00ff88' : undefined },
    { label: 'Critical', value: metrics.critical_issues, color: metrics.critical_issues > 0 ? '#ff1744' : '#00ff88' },
    { label: 'Files Changed', value: metrics.files_changed },
  ]

  return (
    <div className="bg-arena-surface border border-arena-border rounded-lg px-4 py-3">
      <div className="text-[10px] text-slate-600 tracking-widest uppercase mb-2">
        Engineering Scorecard
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline gap-1.5">
            <span
              className="text-base font-bold font-mono tabular-nums"
              style={{ color: item.color ?? '#e2e8f0' }}
            >
              {item.value}
            </span>
            <span className="text-[10px] text-slate-500 tracking-wide">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
