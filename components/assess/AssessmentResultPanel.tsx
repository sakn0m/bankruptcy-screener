import type { AssessmentResult } from '@/lib/assess'

const TIER_STYLE: Record<string, { bg: string; border: string; text: string; ring: string; bar: string }> = {
  'Very Low':  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-200', bar: 'bg-emerald-400' },
  'Low':       { bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    ring: 'ring-teal-200',    bar: 'bg-teal-400' },
  'Moderate':  { bg: 'bg-yellow-50',  border: 'border-yellow-200',  text: 'text-yellow-700',  ring: 'ring-yellow-200',  bar: 'bg-yellow-400' },
  'Elevated':  { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  ring: 'ring-orange-200',  bar: 'bg-orange-400' },
  'High':      { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     ring: 'ring-red-200',     bar: 'bg-red-500' },
  'Very High': { bg: 'bg-red-100',    border: 'border-red-300',     text: 'text-red-800',     ring: 'ring-red-300',     bar: 'bg-red-600' },
}

const ZONE_STYLE = {
  safe: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: '✓ Safe zone (Z > 2.90)' },
  grey: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: '~ Grey zone (1.23 – 2.90)' },
  distress: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: '⚠ Distress zone (Z < 1.23)' },
}

function fmt(v: number | null, decimals = 2, pct = false): string {
  if (v == null) return '—'
  return pct ? (v * 100).toFixed(1) + '%' : v.toFixed(decimals)
}

export default function AssessmentResultPanel({
  result, sectorLabel,
}: {
  result: AssessmentResult
  sectorLabel: string
}) {
  const { altman, tier, estimatedProbability, estimatedProbabilityP25, estimatedProbabilityP75,
          neighbors, sectorComparison } = result
  const ts = TIER_STYLE[tier]
  const zs = ZONE_STYLE[altman.zone]

  return (
    <div className="space-y-4">
      {/* Main score card */}
      <div className={`rounded-xl border p-6 ${ts.bg} ${ts.border}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Estimated bankruptcy risk
        </p>
        <div className="flex items-end gap-3">
          <span className={`text-5xl font-black ${ts.text}`}>
            {(estimatedProbability * 100).toFixed(1)}
            <span className="text-2xl font-semibold">%</span>
          </span>
          <span className={`mb-1.5 px-3 py-1 rounded-full text-sm font-bold border ${ts.bg} ${ts.border} ${ts.text}`}>
            {tier}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          P25–P75 range: {(estimatedProbabilityP25 * 100).toFixed(1)}% – {(estimatedProbabilityP75 * 100).toFixed(1)}%
          &nbsp;· based on {neighbors.length} similar {sectorLabel} firms
        </p>
        {/* Probability bar */}
        <div className="mt-4 bg-white/60 rounded-full h-2 overflow-hidden">
          <div className={`h-full rounded-full ${ts.bar} transition-all`} style={{ width: `${Math.min(estimatedProbability * 100, 100)}%` }} />
        </div>
      </div>

      {/* Altman Z */}
      <div className={`rounded-xl border p-5 ${zs.bg} ${zs.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Altman Z-Score</p>
            <p className={`text-3xl font-black ${zs.text}`}>{altman.z.toFixed(2)}</p>
          </div>
          <div className={`text-right text-sm font-semibold ${zs.text}`}>
            {zs.label}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-zinc-500">
          {(['x1','x2','x3','x4','x5'] as const).map(k => (
            <div key={k} className="bg-white/60 rounded p-1.5 text-center">
              <p className="text-zinc-400 uppercase">{k}</p>
              <p className="font-mono font-semibold text-zinc-700">{altman[k].toFixed(3)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sector comparison */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
          Your ratios vs {sectorLabel} median
        </h3>
        <div className="space-y-3">
          {sectorComparison.map(({ label, userValue, sectorMedian, direction }) => {
            const isRisky = direction === 'lower-is-risk'
              ? (userValue != null && userValue < sectorMedian)
              : (userValue != null && userValue > sectorMedian)

            const isPct = label === 'ROI' || label === 'Profit Margin'
            const userStr = isPct ? fmt(userValue, 1, true) : fmt(userValue)
            const medStr = isPct ? fmt(sectorMedian, 1, true) : fmt(sectorMedian)

            return (
              <div key={label} className="flex items-center gap-3">
                <div className="w-28 text-xs text-zinc-500 shrink-0">{label}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-100 rounded-full h-1.5 relative">
                      {/* Sector median marker */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-zinc-400 rounded"
                           style={{ left: '50%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 text-xs font-mono">
                  <span className={`font-semibold ${isRisky ? 'text-red-600' : 'text-emerald-600'}`}>
                    {userStr}
                  </span>
                  <span className="text-zinc-300">/</span>
                  <span className="text-zinc-400">{medStr}</span>
                </div>
                {isRisky && <span className="text-red-500 text-xs">⚠</span>}
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-zinc-400 mt-3">Your value / sector median · ⚠ = below (or above) sector benchmark</p>
      </div>

      {/* Peer firms */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          5 closest peer firms
        </h3>
        <div className="space-y-2">
          {neighbors.slice(0, 5).map(f => (
            <div key={`${f.company_id}-${f.fiscal_year}`} className="flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-500">{f.company_id} · {f.fiscal_year}</span>
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                  f.risk_tier === 'Very High' ? 'bg-red-100 text-red-800 border-red-300' :
                  f.risk_tier === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                  f.risk_tier === 'Elevated' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  f.risk_tier === 'Moderate' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                  f.risk_tier === 'Low' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>{f.risk_tier}</span>
                <span className="font-mono font-semibold text-zinc-700">
                  {(f.bankruptcy_probability * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
