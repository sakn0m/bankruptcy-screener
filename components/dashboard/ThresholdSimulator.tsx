'use client'
import { useState, useMemo } from 'react'
import * as Slider from '@radix-ui/react-slider'

export default function ThresholdSimulator({ probs }: { probs: number[] }) {
  const [thr, setThr] = useState(0.55)
  const flagged = useMemo(() => probs.filter(p => p >= thr).length, [probs, thr])
  const rate = ((flagged / probs.length) * 100).toFixed(2)

  return (
    <div className="rounded-xl border p-5" style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink-mute)', letterSpacing: '0.18em' }}>Threshold Simulator</p>
          <p className="text-xs" style={{ color: 'var(--ink-mute)' }}>Drag to see how flagged count changes</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--accent)' }}>{flagged.toLocaleString()}</span>
          <p className="text-xs" style={{ color: 'var(--ink-mute)' }}>{rate}% of firms</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs w-6" style={{ color: 'var(--ink-mute)', fontFamily: 'JetBrains Mono' }}>0%</span>
        <Slider.Root
          className="relative flex items-center flex-1 h-5 cursor-pointer"
          min={0} max={1} step={0.01}
          value={[thr]}
          onValueChange={([v]) => setThr(v)}
        >
          <Slider.Track className="relative grow rounded-full h-1" style={{ background: 'var(--bg-alt)' }}>
            <Slider.Range className="absolute rounded-full h-full" style={{ background: 'var(--accent)' }} />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 rounded-full shadow focus:outline-none" style={{ background: 'var(--paper)', border: '2px solid var(--accent)' }} />
        </Slider.Root>
        <span className="text-xs w-8 text-right" style={{ color: 'var(--ink-mute)', fontFamily: 'JetBrains Mono' }}>100%</span>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <div className="rounded px-3 py-1.5 text-sm font-mono font-semibold" style={{ background: 'var(--bg-alt)', color: 'var(--accent)', border: '1px solid var(--rule)' }}>
          thr = {(thr * 100).toFixed(0)}%
        </div>
        <div className="flex gap-2 text-xs">
          {[0.10, 0.31, 0.55, 0.80].map(t => (
            <button
              key={t}
              onClick={() => setThr(t)}
              className="px-2 py-1 rounded transition-colors"
              style={{ background: 'var(--bg-alt)', color: 'var(--ink-soft)', border: '1px solid var(--rule)', fontFamily: 'JetBrains Mono' }}
            >
              {(t * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
