'use client'
import { useState, useMemo } from 'react'
import * as Slider from '@radix-ui/react-slider'

export default function ThresholdSimulator({ probs }: { probs: number[] }) {
  const [thr, setThr] = useState(0.55)

  const flagged = useMemo(() => probs.filter(p => p >= thr).length, [probs, thr])
  const rate = ((flagged / probs.length) * 100).toFixed(2)

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-700">Threshold Simulator</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Drag to see how flagged count changes</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-indigo-600">{flagged.toLocaleString()}</span>
          <p className="text-xs text-zinc-400">{rate}% of firms</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-400 w-10">0%</span>
        <Slider.Root
          className="relative flex items-center flex-1 h-5 cursor-pointer"
          min={0}
          max={1}
          step={0.01}
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

      <div className="mt-3 flex items-center gap-2">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 text-sm font-mono font-medium text-indigo-700">
          thr = {(thr * 100).toFixed(0)}%
        </div>
        <div className="flex gap-2 text-xs text-zinc-400">
          {[0.10, 0.31, 0.55, 0.80].map(t => (
            <button
              key={t}
              onClick={() => setThr(t)}
              className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              {(t * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
