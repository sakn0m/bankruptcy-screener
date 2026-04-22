import { getFirms, getDashboardStats } from '@/lib/data'
import KPIBanner from '@/components/dashboard/KPIBanner'
import RiskDistribution from '@/components/dashboard/RiskDistribution'
import SectorBreakdown from '@/components/dashboard/SectorBreakdown'
import ThresholdSimulator from '@/components/dashboard/ThresholdSimulator'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const firms = getFirms()
  const stats = getDashboardStats(firms)

  // Top 5 flagged firms for the preview table
  const topFlagged = firms.filter(f => f.bankruptcy_predicted === 1).slice(0, 5)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          LightGBM bankruptcy predictions · Italian firms · Fiscal years 2022–2023
        </p>
      </div>

      <KPIBanner stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskDistribution bins={stats.probBins} />
        <ThresholdSimulator probs={stats.allProbs} />
      </div>

      <SectorBreakdown data={stats.sectorBreakdown} />

      {/* Top flagged preview */}
      <div className="bg-white border border-zinc-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-700">Highest Risk Firms</h2>
          <Link href="/screener" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-400 uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Year</th>
              <th className="text-left px-5 py-3 font-medium">Sector</th>
              <th className="text-left px-5 py-3 font-medium">Region</th>
              <th className="text-right px-5 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {topFlagged.map((f, i) => (
              <tr key={`${f.company_id}-${f.fiscal_year}`} className={i % 2 === 0 ? 'bg-zinc-50/50' : ''}>
                <td className="px-5 py-3 font-mono text-xs text-zinc-700">{f.company_id}</td>
                <td className="px-5 py-3 text-zinc-600">{f.fiscal_year}</td>
                <td className="px-5 py-3 text-zinc-600">{f.sector_label}</td>
                <td className="px-5 py-3 text-zinc-600">{f.region}</td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                    {(f.bankruptcy_probability * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model card */}
      <div className="bg-zinc-900 rounded-xl p-6 text-zinc-300">
        <h2 className="text-sm font-semibold text-white mb-3">About This Model</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {[
            ['Algorithm', 'LightGBM + SMOTE'],
            ['Features', '79 engineered'],
            ['Train period', '2018–2020'],
            ['Val year', '2021'],
            ['F1 (2021)', '0.140'],
            ['ROC-AUC (2021)', '0.938'],
            ['PR-AUC (2021)', '0.077'],
            ['Base rate', '0.71%'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-zinc-500 mb-0.5">{k}</p>
              <p className="text-white font-medium">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
