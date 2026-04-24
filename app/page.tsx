import { getFirms, getDashboardStats } from '@/lib/data'
import KPIBanner from '@/components/dashboard/KPIBanner'
import RiskDistribution from '@/components/dashboard/RiskDistribution'
import SectorBreakdown from '@/components/dashboard/SectorBreakdown'
import ThresholdSimulator from '@/components/dashboard/ThresholdSimulator'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const TIER_COLOR: Record<string, string> = {
  'Very Low':  '#2d6a4f',
  'Low':       '#1e7b6e',
  'Moderate':  '#b38b3f',
  'Elevated':  '#c06020',
  'High':      '#7a1f2b',
  'Very High': '#5a1020',
}

export default function DashboardPage() {
  const firms = getFirms()
  const stats = getDashboardStats(firms)
  const topFlagged = firms.slice(0, 5)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b" style={{ borderColor: 'var(--rule)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)', letterSpacing: '0.2em' }}>
          Expert.ai · Challenge 1
        </p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}>
          Bankruptcy Prediction
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-mute)' }}>
          LightGBM · Italian firms · Fiscal years 2022–2023
        </p>
      </div>

      <KPIBanner stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskDistribution bins={stats.probBins} />
        <ThresholdSimulator probs={stats.allProbs} />
      </div>

      <SectorBreakdown data={stats.sectorBreakdown} />

      {/* Top firms */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--rule)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--ink)', fontFamily: 'Fraunces, serif' }}>Highest Risk Firms</h2>
          <Link href="/screener" className="text-xs flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-mute)', borderBottom: '1px solid var(--rule)' }}>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Year</th>
              <th className="text-left px-5 py-3 font-medium">Sector</th>
              <th className="text-left px-5 py-3 font-medium">Tier</th>
              <th className="text-right px-5 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {topFlagged.map((f, i) => (
              <tr key={`${f.company_id}-${f.fiscal_year}`} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,34,56,0.02)', borderBottom: '1px solid var(--rule)' }}>
                <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--ink)' }}>{f.company_id}</td>
                <td className="px-5 py-3" style={{ color: 'var(--ink-soft)' }}>{f.fiscal_year}</td>
                <td className="px-5 py-3" style={{ color: 'var(--ink-soft)' }}>{f.sector_label}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color: TIER_COLOR[f.risk_tier] ?? 'var(--ink)', background: 'rgba(122,31,43,0.07)', border: '1px solid currentColor' }}>
                    {f.risk_tier}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-sm" style={{ color: 'var(--accent)' }}>
                  {(f.bankruptcy_probability * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model card */}
      <div className="rounded-xl p-6" style={{ background: 'var(--ink)', color: 'var(--bg-alt)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded" style={{ background: 'var(--gold)' }} />
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--bg)' }}>About This Model</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {[
            ['Algorithm', 'LightGBM + SMOTE'],
            ['Features', '79 engineered'],
            ['Train period', '2018–2020'],
            ['Val year', '2021'],
            ['F1 (2021)', '0.124'],
            ['ROC-AUC (2021)', '0.918'],
            ['PR-AUC (2021)', '0.054'],
            ['Base rate', '0.71%'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="mb-0.5" style={{ color: 'var(--ink-mute)' }}>{k}</p>
              <p className="font-semibold" style={{ color: 'var(--bg)', fontFamily: 'JetBrains Mono, monospace' }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
