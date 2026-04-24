import type { Firm } from './types'

export interface FirmInputs {
  sector: number
  legal_form: string
  region: string
  total_assets: number       // €M
  total_debt: number         // €M
  short_term_debt: number    // €M
  shareholders_equity: number // €M
  current_assets: number     // €M
  production_value: number   // €M
  operating_income: number   // €M
  net_profit_loss: number    // €M
}

export interface DerivedRatios {
  roi: number
  leverage: number | null
  current_ratio: number | null
  debt_to_assets: number
  profit_margin: number | null
}

export interface AltmanResult {
  z: number
  x1: number; x2: number; x3: number; x4: number; x5: number
  zone: 'distress' | 'grey' | 'safe'
}

export interface AssessmentResult {
  altman: AltmanResult
  ratios: DerivedRatios
  neighbors: Firm[]
  estimatedProbability: number
  estimatedProbabilityP25: number
  estimatedProbabilityP75: number
  tier: 'Very Low' | 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Very High'
  sectorComparison: SectorComparison[]
}

export interface SectorComparison {
  label: string
  userValue: number | null
  sectorMedian: number
  direction: 'lower-is-risk' | 'higher-is-risk'
}

export function deriveRatios(inp: FirmInputs): DerivedRatios {
  const { total_assets, total_debt, short_term_debt, shareholders_equity,
          current_assets, production_value, operating_income, net_profit_loss } = inp
  return {
    roi: total_assets > 0 ? operating_income / total_assets : 0,
    leverage: shareholders_equity > 0 ? total_debt / shareholders_equity : null,
    current_ratio: short_term_debt > 0 ? current_assets / short_term_debt : null,
    debt_to_assets: total_assets > 0 ? total_debt / total_assets : 0,
    profit_margin: production_value > 0 ? net_profit_loss / production_value : null,
  }
}

export function computeAltman(inp: FirmInputs): AltmanResult {
  const { total_assets, total_debt, short_term_debt, shareholders_equity,
          current_assets, production_value, operating_income } = inp
  if (total_assets === 0) {
    return { z: 0, x1: 0, x2: 0, x3: 0, x4: 0, x5: 0, zone: 'distress' }
  }
  const x1 = (current_assets - short_term_debt) / total_assets
  const x2 = shareholders_equity / total_assets
  const x3 = operating_income / total_assets
  const x4 = total_debt > 0 ? shareholders_equity / total_debt : 0
  const x5 = production_value / total_assets
  const z = 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.420 * x4 + 0.998 * x5
  const zone: AltmanResult['zone'] = z > 2.9 ? 'safe' : z < 1.23 ? 'distress' : 'grey'
  return { z, x1, x2, x3, x4, x5, zone }
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2
}

function percentile(arr: number[], p: number): number {
  const s = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (s.length - 1)
  const lo = Math.floor(idx)
  const frac = idx - lo
  return s[lo] + frac * (s[Math.min(lo + 1, s.length - 1)] - s[lo])
}

export function runAssessment(inp: FirmInputs, allFirms: Firm[]): AssessmentResult {
  const ratios = deriveRatios(inp)
  const altman = computeAltman(inp)

  // Pool: prefer same sector, fall back to all
  const sectorPool = allFirms.filter(f => f.ateco_sector === inp.sector)
  const pool = sectorPool.length >= 20 ? sectorPool : allFirms

  // Feature stats for normalization (from full pool)
  const featureKeys: (keyof Firm)[] = ['roi', 'debt_to_assets', 'current_ratio', 'leverage', 'profit_margin']
  const stats: Record<string, { mean: number; std: number }> = {}
  for (const k of featureKeys) {
    const vals = pool.map(f => f[k] as number | null).filter((v): v is number => v != null)
    if (!vals.length) { stats[k] = { mean: 0, std: 1 }; continue }
    const m = vals.reduce((a, b) => a + b, 0) / vals.length
    const s = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length) || 1
    stats[k] = { mean: m, std: s }
  }

  const userVec = {
    roi: ratios.roi,
    debt_to_assets: ratios.debt_to_assets,
    current_ratio: ratios.current_ratio ?? 0,
    leverage: ratios.leverage ?? 0,
    profit_margin: ratios.profit_margin ?? 0,
  }

  // Normalize user vector
  const norm = (v: number, k: string) => (v - stats[k].mean) / stats[k].std

  // Compute distance for each firm
  const scored = pool.map(f => {
    let dist = 0
    for (const k of featureKeys) {
      const fv = (f[k as keyof Firm] as number | null) ?? stats[k].mean
      const uv = userVec[k as keyof typeof userVec]
      dist += (norm(fv, k) - norm(uv, k)) ** 2
    }
    return { firm: f, dist: Math.sqrt(dist) }
  })

  scored.sort((a, b) => a.dist - b.dist)
  const neighbors = scored.slice(0, 15).map(s => s.firm)

  const probs = neighbors.map(f => f.bankruptcy_probability)
  const estimatedProbability = probs.reduce((a, b) => a + b, 0) / probs.length
  const tier = estimatedProbability >= 0.50 ? 'Very High'
    : estimatedProbability >= 0.31 ? 'High'
    : estimatedProbability >= 0.15 ? 'Elevated'
    : estimatedProbability >= 0.07 ? 'Moderate'
    : estimatedProbability >= 0.02 ? 'Low'
    : 'Very Low'

  // Sector medians for comparison
  const sectorFirms = sectorPool.length >= 5 ? sectorPool : allFirms
  const sectorComparison: SectorComparison[] = [
    {
      label: 'ROI',
      userValue: ratios.roi,
      sectorMedian: median(sectorFirms.map(f => f.roi ?? 0)),
      direction: 'lower-is-risk',
    },
    {
      label: 'Debt / Assets',
      userValue: ratios.debt_to_assets,
      sectorMedian: median(sectorFirms.map(f => f.debt_to_assets ?? 0)),
      direction: 'higher-is-risk',
    },
    {
      label: 'Current Ratio',
      userValue: ratios.current_ratio,
      sectorMedian: median(sectorFirms.filter(f => f.current_ratio != null).map(f => f.current_ratio!)),
      direction: 'lower-is-risk',
    },
    {
      label: 'Profit Margin',
      userValue: ratios.profit_margin,
      sectorMedian: median(sectorFirms.filter(f => f.profit_margin != null).map(f => f.profit_margin!)),
      direction: 'lower-is-risk',
    },
    {
      label: 'Leverage',
      userValue: ratios.leverage,
      sectorMedian: median(sectorFirms.filter(f => f.leverage != null).map(f => f.leverage!)),
      direction: 'higher-is-risk',
    },
  ]

  return {
    altman,
    ratios,
    neighbors,
    estimatedProbability,
    estimatedProbabilityP25: percentile(probs, 25),
    estimatedProbabilityP75: percentile(probs, 75),
    tier,
    sectorComparison,
  }
}
