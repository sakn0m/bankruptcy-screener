'use client'
import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Firm } from '@/lib/types'
import { filterFirms } from '@/lib/data'
import FirmDrawer from '@/components/screener/FirmDrawer'
import firms from '@/public/data/firms.json'

const PAGE_SIZE = 50
const ALL_FIRMS = firms as Firm[]
const REGIONS = [...new Set(ALL_FIRMS.map(f => f.region))].sort()
const LEGAL_FORMS = [...new Set(ALL_FIRMS.map(f => f.legal_form))].sort()
const SECTORS = [...new Map(ALL_FIRMS.map(f => [f.ateco_sector, f.sector_label])).entries()].sort((a, b) => a[0] - b[0])

const TIER_COLOR: Record<string, { bg: string; color: string }> = {
  'Very Low':  { bg: 'rgba(45,106,79,0.08)',  color: '#2d6a4f' },
  'Low':       { bg: 'rgba(30,123,110,0.08)', color: '#1e7b6e' },
  'Moderate':  { bg: 'rgba(179,139,63,0.12)', color: '#8a6620' },
  'Elevated':  { bg: 'rgba(192,96,32,0.10)',  color: '#c06020' },
  'High':      { bg: 'rgba(122,31,43,0.10)',  color: '#7a1f2b' },
  'Very High': { bg: 'rgba(122,31,43,0.18)',  color: '#5a1020' },
}

function Select({ value, onChange, placeholder, children }: {
  value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm px-3 py-2 rounded-lg focus:outline-none"
      style={{ background: 'var(--paper)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}

export default function ScreenerPage() {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [region, setRegion] = useState('')
  const [legalForm, setLegalForm] = useState('')
  const [riskTier, setRiskTier] = useState('')
  const [sortCol, setSortCol] = useState<'bankruptcy_probability' | 'company_id' | 'fiscal_year'>('bankruptcy_probability')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const hasFilters = sector || region || legalForm || riskTier

  const filtered = useMemo(() => {
    const f = filterFirms(ALL_FIRMS, {
      search, sector: sector ? parseInt(sector) : null,
      region: region || null, legalForm: legalForm || null, riskTier: riskTier || null,
    })
    return f.sort((a, b) => {
      const av = a[sortCol] as string | number
      const bv = b[sortCol] as string | number
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [search, sector, region, legalForm, riskTier, sortCol, sortDir])

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSort(col: typeof sortCol) {
    if (col === sortCol) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return }
    setSortCol(col); setSortDir('desc')
  }

  const SortArrow = ({ col }: { col: string }) => (
    <span className="ml-1" style={{ color: 'var(--ink-mute)' }}>
      {col === sortCol ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
    </span>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 mb-6 border-b" style={{ borderColor: 'var(--rule)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)', letterSpacing: '0.2em' }}>Company Explorer</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}>Screener</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-mute)' }}>Search and filter all 5,811 scored firms</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-mute)' }} />
          <input
            type="text"
            placeholder="Search company ID or sector…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'var(--paper)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors"
          style={{
            background: showFilters || hasFilters ? 'rgba(122,31,43,0.08)' : 'var(--paper)',
            border: `1px solid ${showFilters || hasFilters ? 'var(--accent)' : 'var(--rule)'}`,
            color: showFilters || hasFilters ? 'var(--accent)' : 'var(--ink-soft)',
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && <span className="text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: 'var(--accent)', color: 'var(--paper)' }}>!</span>}
        </button>
        {hasFilters && (
          <button onClick={() => { setSector(''); setRegion(''); setLegalForm(''); setRiskTier('') }}
            className="flex items-center gap-1 px-3 py-2 text-sm" style={{ color: 'var(--ink-mute)' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex gap-3 mb-4 flex-wrap rounded-xl p-4" style={{ background: 'var(--bg-alt)', border: '1px solid var(--rule)' }}>
          <Select value={riskTier} onChange={v => { setRiskTier(v); setPage(0) }} placeholder="All risk tiers">
            {['Very Low','Low','Moderate','Elevated','High','Very High'].map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={sector} onChange={v => { setSector(v); setPage(0) }} placeholder="All sectors">
            {SECTORS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </Select>
          <Select value={region} onChange={v => { setRegion(v); setPage(0) }} placeholder="All regions">
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select value={legalForm} onChange={v => { setLegalForm(v); setPage(0) }} placeholder="All legal forms">
            {LEGAL_FORMS.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>
          {filtered.length.toLocaleString()} firms{filtered.length !== ALL_FIRMS.length && ` of ${ALL_FIRMS.length.toLocaleString()}`}
        </p>
        <p className="text-xs" style={{ color: 'var(--ink-mute)', fontFamily: 'JetBrains Mono' }}>Page {page + 1} / {pages}</p>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg-alt)' }}>
                {[{ col: 'company_id', label: 'Company' }, { col: 'fiscal_year', label: 'Year' }].map(({ col, label }) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    style={{ color: 'var(--ink-mute)', letterSpacing: '0.12em' }}
                    onClick={() => handleSort(col as typeof sortCol)}>
                    {label}<SortArrow col={col} />
                  </th>
                ))}
                {['Sector','Region','Legal form'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--ink-mute)', letterSpacing: '0.12em' }}>{h}</th>
                ))}
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  style={{ color: 'var(--ink-mute)', letterSpacing: '0.12em' }}
                  onClick={() => handleSort('bankruptcy_probability')}>
                  Score<SortArrow col="bankruptcy_probability" />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--ink-mute)', letterSpacing: '0.12em' }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((f, i) => (
                <tr
                  key={`${f.company_id}-${f.fiscal_year}`}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--rule)', background: i % 2 === 0 ? 'transparent' : 'rgba(26,34,56,0.018)' }}
                  onClick={() => setSelectedFirm(f)}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(122,31,43,0.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'rgba(26,34,56,0.018)'}
                >
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--ink)' }}>{f.company_id}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--ink-soft)' }}>{f.fiscal_year}</td>
                  <td className="px-5 py-3 max-w-[140px] truncate" style={{ color: 'var(--ink-soft)' }}>{f.sector_label}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--ink-soft)' }}>{f.region}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--ink-soft)' }}>{f.legal_form}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs font-semibold" style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono' }}>
                    {(f.bankruptcy_probability * 100).toFixed(2)}%
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{
                      background: TIER_COLOR[f.risk_tier]?.bg ?? 'var(--bg-alt)',
                      color: TIER_COLOR[f.risk_tier]?.color ?? 'var(--ink)',
                      border: `1px solid ${TIER_COLOR[f.risk_tier]?.color ?? 'var(--rule)'}`,
                    }}>
                      {f.risk_tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--rule)', background: 'var(--bg-alt)' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-40"
              style={{ background: 'var(--paper)', border: '1px solid var(--rule)', color: 'var(--ink-soft)' }}>
              ← Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(7, pages) }, (_, i) => {
                const p = page < 4 ? i : page > pages - 4 ? pages - 7 + i : page - 3 + i
                if (p < 0 || p >= pages) return null
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-7 h-7 text-xs rounded-lg"
                    style={{
                      background: page === p ? 'var(--accent)' : 'var(--paper)',
                      color: page === p ? 'var(--paper)' : 'var(--ink-soft)',
                      border: `1px solid ${page === p ? 'var(--accent)' : 'var(--rule)'}`,
                    }}>
                    {p + 1}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
              className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-40"
              style={{ background: 'var(--paper)', border: '1px solid var(--rule)', color: 'var(--ink-soft)' }}>
              Next →
            </button>
          </div>
        )}
      </div>

      <FirmDrawer firm={selectedFirm} onClose={() => setSelectedFirm(null)} />
    </div>
  )
}
