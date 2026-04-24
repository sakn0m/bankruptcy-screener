'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SectorBreakdown({ data }: { data: { sector: string; count: number; total: number }[] }) {
  const chartData = data.slice(0, 8).map(d => ({
    name: d.sector.length > 18 ? d.sector.slice(0, 16) + '…' : d.sector,
    flagged: d.count,
    rate: ((d.count / d.total) * 100).toFixed(1),
  }))

  return (
    <div className="rounded-xl border p-5" style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink-mute)', letterSpacing: '0.18em' }}>By Sector</p>
      <p className="text-xs mb-4" style={{ color: 'var(--ink-mute)' }}>Very High risk firms by ATECO sector</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: '#6c7289', fontFamily: 'JetBrains Mono' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6c7289' }} width={130} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid rgba(26,34,56,0.15)', background: '#faf7f0', color: '#1a2238' }}
            formatter={(v, _name, p) => [
              `${v} firms (${(p as { payload: { rate: string } }).payload.rate}% of sector)`, 'Flagged'
            ]}
          />
          <Bar dataKey="flagged" fill="#7a1f2b" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
