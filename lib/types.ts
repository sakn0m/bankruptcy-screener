export type RiskTier = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Firm {
  company_id: string
  fiscal_year: number
  province: string
  region: string
  ateco_sector: number
  sector_label: string
  legal_form: string
  years_in_business: number | null
  total_assets: number | null
  roi: number | null
  roe: number | null
  leverage: number | null
  current_ratio: number | null
  debt_to_assets: number | null
  profit_margin: number | null
  altman_z_like_score: number | null
  profit_margin_vs_sector: number | null
  leverage_vs_sector: number | null
  roi_vs_sector: number | null
  debt_to_assets_slope: number | null
  current_ratio_slope: number | null
  neg_margin_streak: number | null
  bankruptcy_probability: number
  bankruptcy_predicted: number
  risk_tier: RiskTier
}

export interface DashboardStats {
  total: number
  flagged: number
  flaggedRate: number
  maxProb: number
  sectorBreakdown: { sector: string; count: number; total: number }[]
  probBins: { label: string; count: number }[]
  allProbs: number[]
}
