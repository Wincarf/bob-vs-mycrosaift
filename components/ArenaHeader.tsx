'use client'

import Image from 'next/image'

export function ArenaHeader() {
  return (
    <header className="border-b border-arena-border bg-arena-surface">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded overflow-hidden bg-arena-border flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="Bob"
              width={40}
              height={40}
              className="object-cover"
              onError={() => {}} // silently fail if logo missing
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-widest text-white leading-none">
              <span className="text-bob">BOB</span>
              <span className="text-slate-500 mx-2">VS</span>
              <span className="text-mycrosaift">MYCROSAIFT</span>
            </h1>
            <p className="text-xs text-slate-500 tracking-widest uppercase mt-0.5">
              AI Software Engineering Arena
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bob inline-block" />
            Builder Agent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mycrosaift inline-block" />
            Breaker Agent
          </span>
          <span className="border border-arena-border px-2 py-0.5 rounded text-slate-400">
            IBM Bob 2.0 Hackathon
          </span>
        </div>
      </div>
    </header>
  )
}
