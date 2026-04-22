'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#22c55e','#22c55e','#f59e0b','#f59e0b','#f59e0b','#ef4444','#ef4444','#dc2626']

export default function RiskDistribution({ bins }: { bins: { label: string; count: number }[] }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-zinc-700 mb-4">Score Distribution</h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={bins} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#71717a' }} />
          <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }}
            formatter={(v) => [(v as number).toLocaleString(), 'firms']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {bins.map((_, i) => <Cell key={i} fill={COLORS[i] ?? '#6366f1'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
