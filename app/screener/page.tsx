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
const SECTORS = [...new Map(ALL_FIRMS.map(f => [f.ateco_sector, f.sector_label])).entries()]
  .sort((a, b) => a[0] - b[0])

const TIER_BADGE: Record<string, string> = {
  HIGH: 'bg-red-50 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
  LOW: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

function Select({ value, onChange, placeholder, children }: {
  value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      search,
      sector: sector ? parseInt(sector) : null,
      region: region || null,
      legalForm: legalForm || null,
      riskTier: riskTier || null,
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
    setSortCol(col)
    setSortDir('desc')
  }

  function clearFilters() {
    setSector(''); setRegion(''); setLegalForm(''); setRiskTier('')
  }

  const SortArrow = ({ col }: { col: string }) => (
    <span className="ml-1 text-zinc-400">
      {col === sortCol ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
    </span>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Screener</h1>
        <p className="text-sm text-zinc-500 mt-1">Search and filter all 5,811 scored firms</p>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search company ID or sector…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${showFilters || hasFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex gap-3 mb-4 flex-wrap bg-zinc-50 border border-zinc-200 rounded-xl p-4">
          <Select value={riskTier} onChange={v => { setRiskTier(v); setPage(0) }} placeholder="All risk tiers">
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
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

      {/* Results summary */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-zinc-500">
          {filtered.length.toLocaleString()} firms
          {filtered.length !== ALL_FIRMS.length && ` (of ${ALL_FIRMS.length.toLocaleString()})`}
        </p>
        <p className="text-xs text-zinc-400">Page {page + 1} of {pages}</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                {[
                  { col: 'company_id', label: 'Company' },
                  { col: 'fiscal_year', label: 'Year' },
                ].map(({ col, label }) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700"
                    onClick={() => handleSort(col as typeof sortCol)}
                  >
                    {label}<SortArrow col={col} />
                  </th>
                ))}
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sector</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Region</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Legal form</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700"
                    onClick={() => handleSort('bankruptcy_probability')}>
                  Score<SortArrow col="bankruptcy_probability" />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Risk</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((f, i) => (
                <tr
                  key={`${f.company_id}-${f.fiscal_year}`}
                  className={`cursor-pointer border-b border-zinc-50 hover:bg-indigo-50/40 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-50/30'}`}
                  onClick={() => setSelectedFirm(f)}
                >
                  <td className="px-5 py-3 font-mono text-xs text-zinc-600">{f.company_id}</td>
                  <td className="px-5 py-3 text-zinc-600">{f.fiscal_year}</td>
                  <td className="px-5 py-3 text-zinc-600 max-w-[140px] truncate">{f.sector_label}</td>
                  <td className="px-5 py-3 text-zinc-600">{f.region}</td>
                  <td className="px-5 py-3 text-zinc-600">{f.legal_form}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-zinc-800">
                    {(f.bankruptcy_probability * 100).toFixed(2)}%
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${TIER_BADGE[f.risk_tier]}`}>
                      {f.risk_tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50/50">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(7, pages) }, (_, i) => {
                const p = page < 4 ? i : page > pages - 4 ? pages - 7 + i : page - 3 + i
                if (p < 0 || p >= pages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs rounded-lg ${page === p ? 'bg-indigo-600 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    {p + 1}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <FirmDrawer firm={selectedFirm} onClose={() => setSelectedFirm(null)} />
    </div>
  )
}
