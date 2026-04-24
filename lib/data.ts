import type { Firm, DashboardStats } from './types'

let _firms: Firm[] | null = null

export function getFirms(): Firm[] {
  if (_firms) return _firms
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  _firms = require('../public/data/firms.json') as Firm[]
  return _firms
}

export function getDashboardStats(firms: Firm[]): DashboardStats {
  const flagged = firms.filter(f => f.risk_tier === 'Very High')
  const maxProb = Math.max(...firms.map(f => f.bankruptcy_probability))

  // Sector breakdown (Very High risk tier only)
  const sectorMap = new Map<string, { count: number; total: number }>()
  for (const f of firms) {
    const key = f.sector_label
    if (!sectorMap.has(key)) sectorMap.set(key, { count: 0, total: 0 })
    const entry = sectorMap.get(key)!
    entry.total++
    if (f.risk_tier === 'Very High') entry.count++
  }
  const sectorBreakdown = [...sectorMap.entries()]
    .map(([sector, v]) => ({ sector, ...v }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)

  // Probability histogram (log-ish bins for better visual spread)
  const bins = [
    { label: '0–1%', min: 0, max: 0.01 },
    { label: '1–5%', min: 0.01, max: 0.05 },
    { label: '5–10%', min: 0.05, max: 0.10 },
    { label: '10–20%', min: 0.10, max: 0.20 },
    { label: '20–40%', min: 0.20, max: 0.40 },
    { label: '40–60%', min: 0.40, max: 0.60 },
    { label: '60–80%', min: 0.60, max: 0.80 },
    { label: '80–100%', min: 0.80, max: 1.01 },
  ]
  const probBins = bins.map(b => ({
    label: b.label,
    count: firms.filter(f => f.bankruptcy_probability >= b.min && f.bankruptcy_probability < b.max).length,
  }))

  return {
    total: firms.length,
    flagged: flagged.length,
    flaggedRate: flagged.length / firms.length,
    maxProb,
    sectorBreakdown,
    probBins,
    allProbs: firms.map(f => f.bankruptcy_probability),
  }
}

export function filterFirms(
  firms: Firm[],
  opts: {
    search?: string
    sector?: number | null
    region?: string | null
    legalForm?: string | null
    year?: number | null
    riskTier?: string | null
    threshold?: number
  }
): Firm[] {
  const thr = opts.threshold ?? -1
  return firms.filter(f => {
    if (opts.search) {
      const q = opts.search.toLowerCase()
      if (!f.company_id.toLowerCase().includes(q) && !f.sector_label.toLowerCase().includes(q)) return false
    }
    if (opts.sector != null && f.ateco_sector !== opts.sector) return false
    if (opts.region && f.region !== opts.region) return false
    if (opts.legalForm && f.legal_form !== opts.legalForm) return false
    if (opts.year != null && f.fiscal_year !== opts.year) return false
    if (opts.riskTier && f.risk_tier !== opts.riskTier) return false
    if (thr >= 0 && f.bankruptcy_probability < thr) return false
    return true
  })
}
