'use client'

import { useState } from 'react'
import type { FileDiff } from '@/types'

interface DiffViewerProps {
  diffs: FileDiff[]
}

export function DiffViewer({ diffs }: DiffViewerProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (diffs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 font-mono text-xs">
        <div className="text-2xl mb-2">📁</div>
        <div className="tracking-widest">No code changes yet...</div>
      </div>
    )
  }

  const active = diffs[Math.min(activeIdx, diffs.length - 1)]

  return (
    <div className="flex flex-col h-full">
      {/* File tabs */}
      <div className="flex gap-1 flex-wrap mb-3">
        {diffs.map((diff, i) => (
          <button
            key={`${diff.filename}-${i}`}
            onClick={() => setActiveIdx(i)}
            className={`
              text-[11px] font-mono px-3 py-1.5 rounded border transition-all
              ${i === activeIdx
                ? 'border-bob/50 text-bob bg-bob/10'
                : 'border-arena-border text-slate-500 hover:text-slate-300 hover:border-slate-600'}
            `}
          >
            {diff.filename.split('/').pop()}
          </button>
        ))}
      </div>

      {/* File header */}
      <div className="bg-arena-surface border border-arena-border rounded-t px-3 py-2 flex items-center justify-between">
        <code className="text-xs text-bob/80">{active.filename}</code>
        <span className="text-xs text-slate-500">{active.description}</span>
      </div>

      {/* Diff body */}
      <div className="flex-1 overflow-auto border border-t-0 border-arena-border rounded-b">
        <DiffContent before={active.before} after={active.after} />
      </div>
    </div>
  )
}

function DiffContent({ before, after }: { before: string; after: string }) {
  const isNew = before.trim().startsWith('// file did not exist') || before.trim() === ''

  if (isNew) {
    // Show only the after content as additions
    const lines = after.split('\n')
    return (
      <pre className="text-xs font-mono p-0 m-0 overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className="diff-added flex">
            <span className="w-8 text-right pr-2 select-none opacity-40 text-[10px] border-r border-bob/20 mr-2 flex-shrink-0 leading-5">
              +{i + 1}
            </span>
            <span className="leading-5">{'+ ' + line}</span>
          </div>
        ))}
      </pre>
    )
  }

  // Compute a simple unified diff
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')

  // Find removed and added lines (naive approach for demo diffs)
  const allLines = buildUnifiedDiff(beforeLines, afterLines)

  return (
    <pre className="text-xs font-mono p-0 m-0 overflow-x-auto">
      {allLines.map((entry, i) => (
        <div
          key={i}
          className={
            entry.type === 'add'
              ? 'diff-added flex'
              : entry.type === 'remove'
              ? 'diff-removed flex'
              : 'diff-context flex'
          }
        >
          <span className="w-5 text-right select-none opacity-40 text-[10px] border-r border-slate-700/40 mr-2 flex-shrink-0 leading-5 pl-1">
            {entry.type === 'add' ? '+' : entry.type === 'remove' ? '-' : ' '}
          </span>
          <span className="leading-5">
            {entry.type === 'add' ? '+ ' : entry.type === 'remove' ? '- ' : '  '}
            {entry.line}
          </span>
        </div>
      ))}
    </pre>
  )
}

interface DiffEntry {
  type: 'add' | 'remove' | 'context'
  line: string
}

function buildUnifiedDiff(before: string[], after: string[]): DiffEntry[] {
  // Simple line-by-line diff: lines only in before = removed, only in after = added
  // This is sufficient for our pre-scripted scenario diffs
  const result: DiffEntry[] = []

  const beforeSet = new Set(before.map((l) => l.trimEnd()))
  const afterSet = new Set(after.map((l) => l.trimEnd()))

  // Show removed lines
  for (const line of before) {
    const trimmed = line.trimEnd()
    if (!afterSet.has(trimmed)) {
      result.push({ type: 'remove', line })
    } else {
      result.push({ type: 'context', line })
    }
  }

  // Show added lines (not in before)
  for (const line of after) {
    const trimmed = line.trimEnd()
    if (!beforeSet.has(trimmed)) {
      result.push({ type: 'add', line })
    }
  }

  return result
}
