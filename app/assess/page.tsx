'use client'
import { useState } from 'react'
import { ChevronRight, RotateCcw, Info } from 'lucide-react'
import { runAssessment, deriveRatios, computeAltman, type FirmInputs, type AssessmentResult } from '@/lib/assess'
import { SECTOR_LABELS, ALL_SECTORS } from '@/lib/sectors'
import type { Firm } from '@/lib/types'
import firms from '@/public/data/firms.json'
import AssessmentResultPanel from '@/components/assess/AssessmentResultPanel'

const ALL_FIRMS = firms as Firm[]
const REGIONS = [...new Set(ALL_FIRMS.map(f => f.region))].sort()
const LEGAL_FORMS = [...new Set(ALL_FIRMS.map(f => f.legal_form))].sort()

const DEFAULTS: FirmInputs = {
  sector: 46,
  legal_form: 'SRL',
  region: 'Lombardia',
  total_assets: 10,
  total_debt: 6,
  short_term_debt: 3,
  shareholders_equity: 2,
  current_assets: 5,
  production_value: 15,
  operating_income: 0.4,
  net_profit_loss: 0.2,
}

function Field({
  label, name, value, onChange, hint, type = 'number', children,
}: {
  label: string
  name: string
  value: number | string
  onChange: (v: string) => void
  hint?: string
  type?: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children ?? (
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value}
            onChange={e => onChange(e.target.value)}
            step="any"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {hint && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">{hint}</span>
          )}
        </div>
      )}
    </div>
  )
}

function SelectField({
  label, value, onChange, children,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {children}
      </select>
    </div>
  )
}

export default function AssessPage() {
  const [form, setForm] = useState<FirmInputs>(DEFAULTS)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)

  function set(key: keyof FirmInputs, val: string) {
    setForm(f => ({ ...f, [key]: key === 'legal_form' || key === 'region' ? val : parseFloat(val) || 0 }))
  }

  function setSector(val: string) {
    setForm(f => ({ ...f, sector: parseInt(val) || 0 }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setResult(runAssessment(form, ALL_FIRMS))
      setLoading(false)
    }, 320) // small delay for perceived computation
  }

  function reset() {
    setResult(null)
    setForm(DEFAULTS)
  }

  // Live ratios preview
  const ratios = deriveRatios(form)
  const altman = computeAltman(form)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Risk Assessment</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Enter a firm&apos;s financials to estimate bankruptcy risk using peer comparison
          </p>
        </div>
        {result && (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <RotateCcw size={14} /> New assessment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Firm Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField label="Sector" value={form.sector} onChange={setSector}>
                {ALL_SECTORS.map(s => (
                  <option key={s.code} value={s.code}>{s.label}</option>
                ))}
              </SelectField>
              <SelectField label="Legal form" value={form.legal_form} onChange={v => set('legal_form', v)}>
                {LEGAL_FORMS.map(l => <option key={l} value={l}>{l}</option>)}
              </SelectField>
              <SelectField label="Region" value={form.region} onChange={v => set('region', v)}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </SelectField>
            </div>
          </div>

          {/* Balance sheet */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Balance Sheet</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Total assets" name="total_assets" value={form.total_assets} onChange={v => set('total_assets', v)} hint="€M" />
              <Field label="Total debt" name="total_debt" value={form.total_debt} onChange={v => set('total_debt', v)} hint="€M" />
              <Field label="Short-term debt" name="short_term_debt" value={form.short_term_debt} onChange={v => set('short_term_debt', v)} hint="€M" />
              <Field label="Shareholders equity" name="shareholders_equity" value={form.shareholders_equity} onChange={v => set('shareholders_equity', v)} hint="€M" />
              <Field label="Current assets" name="current_assets" value={form.current_assets} onChange={v => set('current_assets', v)} hint="€M" />
            </div>
          </div>

          {/* P&L */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Income Statement</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Production value" name="production_value" value={form.production_value} onChange={v => set('production_value', v)} hint="€M" />
              <Field label="Operating income" name="operating_income" value={form.operating_income} onChange={v => set('operating_income', v)} hint="€M" />
              <Field label="Net profit / loss" name="net_profit_loss" value={form.net_profit_loss} onChange={v => set('net_profit_loss', v)} hint="€M" />
            </div>
          </div>

          {/* Live ratio preview */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Derived ratios</h2>
              <Info size={12} className="text-zinc-400" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { label: 'ROI', value: (ratios.roi * 100).toFixed(1) + '%' },
                { label: 'Leverage', value: ratios.leverage != null ? ratios.leverage.toFixed(2) : '—' },
                { label: 'Current ratio', value: ratios.current_ratio != null ? ratios.current_ratio.toFixed(2) : '—' },
                { label: 'Debt / assets', value: ratios.debt_to_assets.toFixed(3) },
                { label: 'Profit margin', value: ratios.profit_margin != null ? (ratios.profit_margin * 100).toFixed(1) + '%' : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg border border-zinc-200 px-3 py-2.5">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-mono font-semibold text-zinc-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-zinc-500">Altman Z:</span>
              <span className={`font-mono font-semibold text-sm ${altman.zone === 'safe' ? 'text-emerald-600' : altman.zone === 'distress' ? 'text-red-600' : 'text-amber-600'}`}>
                {altman.z.toFixed(2)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                altman.zone === 'safe' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                altman.zone === 'distress' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {altman.zone === 'safe' ? 'Safe zone' : altman.zone === 'distress' ? 'Distress zone' : 'Grey zone'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || form.total_assets === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing…</span>
            ) : (
              <>Run assessment <ChevronRight size={16} /></>
            )}
          </button>
        </form>

        {/* Result panel */}
        <div className="space-y-4">
          {result ? (
            <AssessmentResultPanel result={result} sectorLabel={SECTOR_LABELS[form.sector] ?? 'Unknown'} />
          ) : (
            <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-8 text-center text-zinc-400">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm font-medium text-zinc-500">Results will appear here</p>
              <p className="text-xs mt-1">Fill in the financials and click Run assessment</p>
            </div>
          )}

          {/* Methodology note */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-500 space-y-1.5">
            <p className="font-semibold text-zinc-600">How it works</p>
            <p>1. Your inputs are converted to financial ratios.</p>
            <p>2. We find the 15 most similar firms from our scored dataset of 5,811 Italian firms (2022–2023).</p>
            <p>3. The risk estimate is the average bankruptcy probability of those peers.</p>
            <p>4. The Altman Z-score is computed independently using the original Taffler–Tisshaw weights.</p>
            <p className="text-zinc-400 pt-1">This is an estimate, not a direct model prediction. For reference only.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
