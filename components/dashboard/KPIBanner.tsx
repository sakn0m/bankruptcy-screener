import { KPI } from './KPI'

export default function KPIBanner({ stats }: { stats: any }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPI label="Firms scored" value={stats.total.toLocaleString()} sub="2022–2023 test period" />
      <KPI
        label="Very High risk"
        value={stats.flagged.toLocaleString()}
        sub={`${(stats.flaggedRate * 100).toFixed(2)}% of test sample`}
        color="text-red-600"
      />
      <KPI label="Max risk score" value={(stats.maxProb * 100).toFixed(1) + '%'} sub="Highest probability firm" color="text-amber-600" />
      <KPI label="Model AUC" value="0.918" sub="ROC-AUC · 2021 validation" color="text-indigo-600" />
    </div>
  )
}
