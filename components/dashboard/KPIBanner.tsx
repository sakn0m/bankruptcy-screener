import type { DashboardStats } from '@/lib/types'

function KPI({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color ?? 'text-zinc-900'}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function KPIBanner({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPI label="Firms scored" value={stats.total.toLocaleString()} sub="2022–2023 test period" />
      <KPI
        label="Flagged"
        value={stats.flagged.toLocaleString()}
        sub={`${(stats.flaggedRate * 100).toFixed(2)}% predicted rate`}
        color="text-red-600"
      />
      <KPI label="Max risk score" value={(stats.maxProb * 100).toFixed(1) + '%'} sub="Highest probability firm" color="text-amber-600" />
      <KPI label="Model AUC" value="0.938" sub="ROC-AUC · 2021 validation" color="text-indigo-600" />
    </div>
  )
}
