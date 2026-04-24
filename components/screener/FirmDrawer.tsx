'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { Firm } from '@/lib/types'

function fmt(v: number | null, decimals = 2, suffix = '') {
  if (v == null) return '—'
  return v.toFixed(decimals) + suffix
}

function pct(v: number | null) {
  if (v == null) return '—'
  return (v * 100).toFixed(1) + '%'
}

const SHAP_FEATURES: { key: keyof Firm; label: string; format: (v: Firm) => string; higherIsRisk: boolean }[] = [
  { key: 'profit_margin_vs_sector', label: 'Profit margin vs sector', format: f => fmt(f.profit_margin_vs_sector, 3), higherIsRisk: false },
  { key: 'roi', label: 'Return on investment', format: f => pct(f.roi), higherIsRisk: false },
  { key: 'debt_to_assets', label: 'Debt to assets', format: f => fmt(f.debt_to_assets, 3), higherIsRisk: true },
  { key: 'current_ratio', label: 'Current ratio', format: f => fmt(f.current_ratio, 2), higherIsRisk: false },
  { key: 'leverage_vs_sector', label: 'Leverage vs sector', format: f => fmt(f.leverage_vs_sector, 3), higherIsRisk: true },
  { key: 'debt_to_assets_slope', label: 'Debt/assets trend (slope)', format: f => fmt(f.debt_to_assets_slope, 4), higherIsRisk: true },
  { key: 'current_ratio_slope', label: 'Current ratio trend (slope)', format: f => fmt(f.current_ratio_slope, 4), higherIsRisk: false },
]

function FeatureBar({ label, value, rawValue, isRisky }: { label: string; value: number | null; rawValue: string; isRisky?: boolean }) {
  const pctWidth = value != null ? Math.min(Math.abs(value) * 80 + 5, 95) : 5
  return (
    <div className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
      <div className="w-44 text-xs text-zinc-500 shrink-0">{label}</div>
      <div className="flex-1 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${isRisky ? 'bg-red-400' : 'bg-indigo-400'}`}
          style={{ width: `${pctWidth}%` }}
        />
      </div>
      <div className={`w-20 text-xs font-mono text-right ${isRisky ? 'text-red-600' : 'text-zinc-700'}`}>
        {rawValue}
      </div>
    </div>
  )
}

const TIER_STYLE: Record<string, string> = {
  'Very Low':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low':       'bg-teal-50 text-teal-700 border-teal-200',
  'Moderate':  'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Elevated':  'bg-orange-50 text-orange-700 border-orange-200',
  'High':      'bg-red-50 text-red-700 border-red-200',
  'Very High': 'bg-red-100 text-red-800 border-red-300',
}

export default function FirmDrawer({ firm, onClose }: { firm: Firm | null; onClose: () => void }) {
  return (
    <Dialog.Root open={firm != null} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto focus:outline-none">
          {firm && (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-zinc-400">{firm.company_id}</p>
                  <h2 className="text-lg font-bold text-zinc-900 mt-0.5">{firm.sector_label}</h2>
                  <p className="text-sm text-zinc-500">{firm.region} · {firm.legal_form} · {firm.fiscal_year}</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700">
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Risk score */}
                <div className="bg-zinc-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">Bankruptcy probability</p>
                    <p className="text-4xl font-bold text-zinc-900 mt-1">
                      {(firm.bankruptcy_probability * 100).toFixed(1)}
                      <span className="text-lg font-normal text-zinc-400">%</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${TIER_STYLE[firm.risk_tier]}`}>
                    {firm.risk_tier}
                  </span>
                </div>

                {/* Company details */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Company Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Province', firm.province],
                      ['Legal form', firm.legal_form],
                      ['Years active', firm.years_in_business != null ? String(firm.years_in_business) : '—'],
                      ['Total assets', firm.total_assets != null ? '€' + (firm.total_assets / 1e6).toFixed(1) + 'M' : '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-zinc-50 rounded-lg p-3">
                        <p className="text-xs text-zinc-400">{k}</p>
                        <p className="text-sm font-medium text-zinc-800 mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Altman Z */}
                {firm.altman_z_like_score != null && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Altman Z-Score</h3>
                    <div className={`rounded-xl p-4 ${firm.altman_z_like_score < 1.23 ? 'bg-red-50 border border-red-200' : firm.altman_z_like_score > 2.9 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                      <p className="text-2xl font-bold text-zinc-900">{firm.altman_z_like_score.toFixed(2)}</p>
                      <p className="text-xs mt-1 text-zinc-600">
                        {firm.altman_z_like_score < 1.23 ? '⚠ Distress zone (< 1.23)' : firm.altman_z_like_score > 2.9 ? '✓ Safe zone (> 2.90)' : '~ Grey zone (1.23–2.90)'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Consecutive negative margin streak */}
                {firm.neg_margin_streak != null && firm.neg_margin_streak > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Distress Signal</p>
                    <p className="text-lg font-bold text-red-700 mt-1">{firm.neg_margin_streak} consecutive</p>
                    <p className="text-xs text-red-600">negative-margin years</p>
                  </div>
                )}

                {/* SHAP-style feature bars */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Key Risk Factors <span className="font-normal text-zinc-300">(SHAP-ranked)</span>
                  </h3>
                  {SHAP_FEATURES.map(({ key, label, format, higherIsRisk }) => {
                    const val = firm[key] as number | null
                    const isRisky = higherIsRisk ? (val != null && val > 0) : (val != null && val < 0)
                    return (
                      <FeatureBar
                        key={key}
                        label={label}
                        value={val}
                        rawValue={format(firm)}
                        isRisky={isRisky}
                      />
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
