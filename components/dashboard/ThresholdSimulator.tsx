'use client'

import { useState, useMemo } from 'react'
import * as Slider from '@radix-ui/react-slider'

export default function ThresholdSimulator({ probs }: { probs: number[] }) {
  const [thr, setThr] = useState(0.109)

  const flagged = useMemo(() => probs.filter(p => p >= thr).length, [probs, thr])
  const rate = ((flagged / probs.length) * 100).toFixed(2)

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-zinc-900 font-semibold mb-1">Risk Threshold Simulator</h3>
          <p className="text-sm text-zinc-500">Analyze coverage at different probability cut-offs</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{flagged.toLocaleString()}</div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Firms Flagged</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs text-zinc-400 w-10">0%</span>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          max={1}
          step={0.001}
          value={[thr]}
          onValueChange={([v]) => setThr(v)}
        >
          <Slider.Track className="bg-zinc-200 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-indigo-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1" />
        </Slider.Root>
        <span className="text-xs text-zinc-400 w-10 text-right">100%</span>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 text-sm font-mono font-medium text-indigo-700">
          thr = {(thr * 100).toFixed(1)}%
        </div>
        <div className="flex gap-2 text-xs text-zinc-400">
          {[0.109, 0.20, 0.40, 0.60].map(t => (
            <button
              key={t}
              onClick={() => setThr(t)}
              className="hover:text-indigo-600 px-1 py-0.5 rounded transition-colors"
            >
              {t === 0.109 ? 'default' : (t * 100).toFixed(0) + '%'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
        <div className="text-sm text-zinc-500">Impact on Portfolio</div>
        <div className="text-sm font-semibold text-zinc-900">{rate}% of sample</div>
      </div>
    </div>
  )
}
