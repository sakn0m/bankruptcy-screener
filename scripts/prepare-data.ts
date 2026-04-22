import fs from 'fs'
import path from 'path'
import readline from 'readline'

const SRC = '/Users/giorgiovanini/Desktop/slides with claude code'
const OUT = path.join(__dirname, '../public/data/firms.json')

const SECTORS: Record<string, string> = {
  '10': 'Food manufacturing',
  '25': 'Metal products',
  '41': 'Building construction',
  '43': 'Specialised construction',
  '45': 'Motor trade & repair',
  '46': 'Wholesale trade',
  '47': 'Retail trade',
  '56': 'Restaurants & catering',
  '62': 'Software & IT',
  '68': 'Real estate',
  '71': 'Architecture & engineering',
  '77': 'Rental & leasing',
  '82': 'Business support services',
}

function parseNum(v: string): number | null {
  if (v === '' || v === 'NA' || v === 'NaN' || v === 'nan' || v === 'None') return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function parseStr(v: string): string {
  return v.trim()
}

async function readCsv(filePath: string): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = []
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity })
  let headers: string[] = []
  for await (const line of rl) {
    if (!headers.length) { headers = line.split(','); continue }
    const vals = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h.trim()] = (vals[i] ?? '').trim() })
    rows.push(row)
  }
  return rows
}

async function main() {
  console.log('Reading source files…')

  const [features, predictions, enhanced] = await Promise.all([
    readCsv(path.join(SRC, 'data/test_features.csv')),
    readCsv(path.join(SRC, 'data/processed/challenge1_test_predictions.csv')),
    readCsv(path.join(SRC, 'test_features_enhanced.csv')),
  ])

  console.log(`  features: ${features.length} rows`)
  console.log(`  predictions: ${predictions.length} rows`)
  console.log(`  enhanced: ${enhanced.length} rows`)

  // Index predictions by key
  const predMap = new Map<string, Record<string, string>>()
  for (const p of predictions) {
    predMap.set(`${p.company_id}|${p.fiscal_year}`, p)
  }

  // Index enhanced by key
  const enhMap = new Map<string, Record<string, string>>()
  for (const e of enhanced) {
    enhMap.set(`${e.company_id}|${e.fiscal_year}`, e)
  }

  const firms = features.map((f) => {
    const key = `${f.company_id}|${f.fiscal_year}`
    const pred = predMap.get(key) ?? {}
    const enh = enhMap.get(key) ?? {}

    const prob = parseNum(pred.bankruptcy_probability ?? '') ?? 0
    const riskTier = prob >= 0.31 ? 'HIGH' : prob >= 0.10 ? 'MEDIUM' : 'LOW'
    const sector = parseStr(f.ateco_sector)

    return {
      company_id: parseStr(f.company_id),
      fiscal_year: parseInt(f.fiscal_year) || 0,
      province: parseStr(f.province), // preserve "NA" as string
      region: parseStr(f.region),
      ateco_sector: parseInt(sector) || 0,
      sector_label: SECTORS[sector] ?? sector,
      legal_form: parseStr(f.legal_form),
      years_in_business: parseNum(f.years_in_business),
      total_assets: parseNum(f.total_assets),
      roi: parseNum(f.roi),
      roe: parseNum(f.roe),
      leverage: parseNum(f.leverage),
      current_ratio: parseNum(f.current_ratio),
      debt_to_assets: parseNum(f.debt_to_assets),
      profit_margin: parseNum(f.profit_margin),
      // engineered features
      altman_z_like_score: parseNum(enh.altman_z_like_score ?? ''),
      profit_margin_vs_sector: parseNum(enh.profit_margin_vs_sector ?? ''),
      leverage_vs_sector: parseNum(enh.leverage_vs_sector ?? ''),
      roi_vs_sector: parseNum(enh.roi_vs_sector ?? ''),
      debt_to_assets_slope: parseNum(enh.debt_to_assets_slope ?? ''),
      current_ratio_slope: parseNum(enh.current_ratio_slope ?? ''),
      neg_margin_streak: parseNum(enh.neg_margin_streak ?? ''),
      // prediction
      bankruptcy_probability: prob,
      bankruptcy_predicted: parseInt(pred.bankruptcy_predicted ?? '0') || 0,
      risk_tier: riskTier,
    }
  })

  // Sort: highest probability first
  firms.sort((a, b) => b.bankruptcy_probability - a.bankruptcy_probability)

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(firms))
  console.log(`\nWrote ${firms.length} firms → ${OUT}`)
  console.log(`File size: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`)

  const flagged = firms.filter(f => f.risk_tier === 'HIGH').length
  const medium = firms.filter(f => f.risk_tier === 'MEDIUM').length
  console.log(`\nRisk tiers: HIGH=${flagged}, MEDIUM=${medium}, LOW=${firms.length - flagged - medium}`)
}

main().catch(console.error)
