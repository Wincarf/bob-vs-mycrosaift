'use client'

import { useState } from 'react'
import { useWorkflow } from '@/lib/useWorkflow'
import { ArenaHeader } from '@/components/ArenaHeader'
import { AgentPanel } from '@/components/AgentPanel'
import { RoundIndicator } from '@/components/RoundIndicator'
import { TaskInput } from '@/components/TaskInput'
import { ActivityFeed } from '@/components/ActivityFeed'
import { FindingsPanel } from '@/components/FindingsPanel'
import { DiffViewer } from '@/components/DiffViewer'
import { MetricsBar } from '@/components/MetricsBar'
import { FinalVerdict } from '@/components/FinalVerdict'
import { SCENARIOS } from '@/scenarios'

export default function HomePage() {
  const {
    status,
    events,
    findings,
    diffs,
    metrics,
    currentRound,
    totalRounds,
    finalState,
    error,
    lastBobMessage,
    lastMycrosaiftMessage,
    start,
    reset,
  } = useWorkflow()

  const [activeTab, setActiveTab] = useState<'feed' | 'findings' | 'diffs'>('feed')
  const [lastChallengeId, setLastChallengeId] = useState('password-reset')

  const isBobActive = status === 'bob_building' || status === 'bob_fixing'
  const isMycrosaiftActive = status === 'mycrosaift_attacking'

  function handleStart(challengeId: string) {
    setLastChallengeId(challengeId)
    setActiveTab('feed')
    start(challengeId)
  }

  function handleRunAgain() {
    start(lastChallengeId)
    setActiveTab('feed')
  }

  const isRunning = status !== 'idle' && status !== 'validated' && status !== 'failed' && status !== 'error'
  const taskDescription = SCENARIOS[lastChallengeId]?.task_description ?? ''

  return (
    <div className="flex flex-col min-h-screen bg-arena-bg">
      <ArenaHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* Task input / challenge selector */}
        {(status === 'idle' || status === 'error') && (
          <TaskInput status={status} onStart={handleStart} onReset={reset} />
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-mycrosaift/10 border border-mycrosaift/40 rounded-lg px-4 py-3 text-sm text-mycrosaift font-mono flex items-center gap-3">
            <span className="text-mycrosaift">✗</span>
            <span className="flex-1">{error}</span>
            <button
              onClick={reset}
              className="text-xs border border-mycrosaift/40 px-3 py-1 rounded hover:bg-mycrosaift/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Active task banner */}
        {isRunning && taskDescription && (
          <div className="bg-arena-surface border border-arena-border rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-bob animate-pulse flex-shrink-0" />
            <span className="text-xs text-slate-400 font-mono flex-1">
              <span className="text-slate-600 mr-2">TASK:</span>
              {taskDescription}
            </span>
          </div>
        )}

        {/* Agent panels + round indicator */}
        {status !== 'idle' && (
          <div className="flex gap-4 items-stretch">
            <AgentPanel
              agent="BOB"
              status={status}
              currentMessage={lastBobMessage}
              isActive={isBobActive}
            />
            <RoundIndicator
              currentRound={currentRound}
              totalRounds={totalRounds}
              status={status}
            />
            <AgentPanel
              agent="MYCROSAIFT"
              status={status}
              currentMessage={lastMycrosaiftMessage}
              isActive={isMycrosaiftActive}
            />
          </div>
        )}

        {/* Metrics bar */}
        {status !== 'idle' && (
          <MetricsBar metrics={metrics} />
        )}

        {/* Tabbed content area */}
        {status !== 'idle' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs */}
            <div className="flex gap-1 mb-3">
              {([
                { key: 'feed', label: `Activity (${events.length})` },
                {
                  key: 'findings',
                  label: `Findings (${findings.length})`,
                  highlight: findings.some((f) => f.status === 'OPEN'),
                },
                { key: 'diffs', label: `Code Diffs (${diffs.length})` },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-4 py-2 text-xs font-mono tracking-widest rounded-t border transition-all
                    ${activeTab === tab.key
                      ? 'border-b-transparent border-arena-border bg-arena-surface text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300'}
                    ${(tab as { highlight?: boolean }).highlight && activeTab !== tab.key
                      ? 'text-mycrosaift'
                      : ''}
                  `}
                >
                  {tab.label}
                  {(tab as { highlight?: boolean }).highlight && activeTab !== tab.key && (
                    <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-mycrosaift inline-block animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-arena-surface border border-arena-border rounded-b rounded-tr-lg flex-1 overflow-hidden">
              {activeTab === 'feed' && (
                <div className="h-[460px] flex flex-col">
                  <ActivityFeed events={events} />
                </div>
              )}

              {activeTab === 'findings' && (
                <div className="h-[460px] overflow-y-auto p-4">
                  <FindingsPanel findings={findings} />
                </div>
              )}

              {activeTab === 'diffs' && (
                <div className="h-[460px] p-4 flex flex-col">
                  <DiffViewer diffs={diffs} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reset button while running is not shown — wait until done */}
        {(status === 'validated' || status === 'failed') && !finalState && (
          <TaskInput status={status} onStart={handleStart} onReset={reset} />
        )}

      </main>

      {/* Final verdict overlay */}
      {finalState && (
        <FinalVerdict
          state={finalState}
          onReset={reset}
          onRunAgain={handleRunAgain}
        />
      )}
    </div>
  )
}
