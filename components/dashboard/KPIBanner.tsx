import type { DashboardStats } from '@/lib/types'

function KPI({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink-mute)', letterSpacing: '0.18em' }}>{label}</p>
      <p className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: accent ? 'var(--accent)' : 'var(--ink)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--ink-mute)' }}>{sub}</p>}
    </div>
  )
}

export default function KPIBanner({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPI label="Firms scored" value={stats.total.toLocaleString()} sub="2022–2023 test period" />
      <KPI label="Very High risk" value={stats.flagged.toLocaleString()} sub={`${(stats.flaggedRate * 100).toFixed(2)}% of test sample`} accent />
      <KPI label="Max risk score" value={(stats.maxProb * 100).toFixed(1) + '%'} sub="Highest probability firm" accent />
      <KPI label="Model AUC" value="0.918" sub="ROC-AUC · 2021 validation" />
    </div>
  )
}
