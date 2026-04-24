'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#2d6a4f','#2d6a4f','#b38b3f','#b38b3f','#b38b3f','#a44752','#7a1f2b','#5a1020']

export default function RiskDistribution({ bins }: { bins: { label: string; count: number }[] }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink-mute)', letterSpacing: '0.18em' }}>Score Distribution</p>
      <p className="text-xs mb-4" style={{ color: 'var(--ink-mute)' }}>Probability buckets across 5,811 firms</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={bins} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6c7289', fontFamily: 'JetBrains Mono' }} />
          <YAxis tick={{ fontSize: 10, fill: '#6c7289', fontFamily: 'JetBrains Mono' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid rgba(26,34,56,0.15)', background: '#faf7f0', color: '#1a2238' }}
            formatter={(v) => [(v as number).toLocaleString(), 'firms']}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {bins.map((_, i) => <Cell key={i} fill={COLORS[i] ?? '#7a1f2b'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
