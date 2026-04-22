'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SectorBreakdown({ data }: { data: { sector: string; count: number; total: number }[] }) {
  const chartData = data.slice(0, 8).map(d => ({
    name: d.sector.length > 18 ? d.sector.slice(0, 16) + '…' : d.sector,
    flagged: d.count,
    rate: ((d.count / d.total) * 100).toFixed(1),
  }))

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-zinc-700 mb-4">Flagged Firms by Sector</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} width={130} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }}
            formatter={(v, _name, p) => [
              `${v} firms (${(p as { payload: { rate: string } }).payload.rate}% of sector)`, 'Flagged'
            ]}
          />
          <Bar dataKey="flagged" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
