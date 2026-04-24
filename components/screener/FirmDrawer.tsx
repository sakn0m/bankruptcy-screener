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
  { key: 'debt_to_assets_slope', label: 'Debt/assets trend', format: f => fmt(f.debt_to_assets_slope, 4), higherIsRisk: true },
  { key: 'current_ratio_slope', label: 'Current ratio trend', format: f => fmt(f.current_ratio_slope, 4), higherIsRisk: false },
]

function FeatureBar({ label, value, rawValue, isRisky }: { label: string; value: number | null; rawValue: string; isRisky?: boolean }) {
  const pctWidth = value != null ? Math.min(Math.abs(value) * 80 + 5, 95) : 5
  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--rule)' }}>
      <div className="w-44 text-xs shrink-0" style={{ color: 'var(--ink-mute)' }}>{label}</div>
      <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
        <div className="h-full rounded-full" style={{ width: `${pctWidth}%`, background: isRisky ? 'var(--accent)' : 'var(--gold)' }} />
      </div>
      <div className="w-20 text-xs font-mono text-right" style={{ color: isRisky ? 'var(--accent)' : 'var(--ink)', fontFamily: 'JetBrains Mono' }}>
        {rawValue}
      </div>
    </div>
  )
}

const TIER_COLOR: Record<string, string> = {
  'Very Low':  '#2d6a4f', 'Low': '#1e7b6e', 'Moderate': '#8a6620',
  'Elevated':  '#c06020', 'High': '#7a1f2b', 'Very High': '#5a1020',
}

export default function FirmDrawer({ firm, onClose }: { firm: Firm | null; onClose: () => void }) {
  const altman = firm?.altman_z_like_score
  const altmanZone = altman == null ? null : altman < 1.23 ? 'distress' : altman > 2.9 ? 'safe' : 'grey'

  return (
    <Dialog.Root open={firm != null} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40" style={{ background: 'rgba(26,34,56,0.4)' }} />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md z-50 overflow-y-auto focus:outline-none" style={{ background: 'var(--paper)' }}>
          {firm && (
            <>
              {/* Header */}
              <div className="sticky top-0 px-6 py-4 flex items-start justify-between border-b" style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}>
                <div>
                  <p className="font-mono text-xs" style={{ color: 'var(--ink-mute)', fontFamily: 'JetBrains Mono' }}>{firm.company_id}</p>
                  <h2 className="text-lg font-bold mt-0.5" style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}>{firm.sector_label}</h2>
                  <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>{firm.region} · {firm.legal_form} · {firm.fiscal_year}</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--ink-mute)' }}>
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Risk score */}
                <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--bg-alt)', border: '1px solid var(--rule)' }}>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-mute)', letterSpacing: '0.16em' }}>Bankruptcy probability</p>
                    <p className="text-4xl font-bold mt-1" style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}>
                      {(firm.bankruptcy_probability * 100).toFixed(1)}
                      <span className="text-lg font-normal" style={{ color: 'var(--ink-mute)' }}>%</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded text-sm font-semibold" style={{
                    background: 'rgba(122,31,43,0.08)', color: TIER_COLOR[firm.risk_tier] ?? 'var(--ink)',
                    border: `1px solid ${TIER_COLOR[firm.risk_tier] ?? 'var(--rule)'}`,
                  }}>
                    {firm.risk_tier}
                  </span>
                </div>

                {/* Company details */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-mute)', letterSpacing: '0.16em' }}>Company Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Province', firm.province],
                      ['Legal form', firm.legal_form],
                      ['Years active', firm.years_in_business != null ? String(firm.years_in_business) : '—'],
                      ['Total assets', firm.total_assets != null ? '€' + (firm.total_assets / 1e6).toFixed(1) + 'M' : '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg p-3" style={{ background: 'var(--bg-alt)', border: '1px solid var(--rule)' }}>
                        <p className="text-xs" style={{ color: 'var(--ink-mute)' }}>{k}</p>
                        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Altman Z */}
                {altman != null && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-mute)', letterSpacing: '0.16em' }}>Altman Z-Score</h3>
                    <div className="rounded-xl p-4" style={{
                      background: altmanZone === 'distress' ? 'rgba(122,31,43,0.06)' : altmanZone === 'safe' ? 'rgba(45,106,79,0.06)' : 'rgba(179,139,63,0.06)',
                      border: `1px solid ${altmanZone === 'distress' ? 'var(--accent)' : altmanZone === 'safe' ? '#2d6a4f' : 'var(--gold)'}`,
                    }}>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}>{altman.toFixed(2)}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                        {altmanZone === 'distress' ? '⚠ Distress zone (< 1.23)' : altmanZone === 'safe' ? '✓ Safe zone (> 2.90)' : '~ Grey zone (1.23–2.90)'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Negative margin streak */}
                {firm.neg_margin_streak != null && firm.neg_margin_streak > 0 && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(122,31,43,0.06)', border: '1px solid var(--accent)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)', letterSpacing: '0.16em' }}>Distress Signal</p>
                    <p className="text-lg font-bold mt-1" style={{ fontFamily: 'Fraunces, serif', color: 'var(--accent)' }}>{firm.neg_margin_streak} consecutive</p>
                    <p className="text-xs" style={{ color: 'var(--accent-soft)' }}>negative-margin years</p>
                  </div>
                )}

                {/* SHAP feature bars */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-mute)', letterSpacing: '0.16em' }}>
                    Key Risk Factors <span className="font-normal" style={{ color: 'var(--ink-mute)', opacity: 0.6 }}>(SHAP-ranked)</span>
                  </h3>
                  {SHAP_FEATURES.map(({ key, label, format, higherIsRisk }) => {
                    const val = firm[key] as number | null
                    const isRisky = higherIsRisk ? (val != null && val > 0) : (val != null && val < 0)
                    return <FeatureBar key={key} label={label} value={val} rawValue={format(firm)} isRisky={isRisky} />
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
