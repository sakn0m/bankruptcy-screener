'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Search, FlaskConical, AlertTriangle } from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/screener', label: 'Screener', icon: Search },
  { href: '/assess', label: 'Assess', icon: FlaskConical },
]

export default function Nav() {
  const path = usePathname()
  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full border-r" style={{ background: 'var(--ink)', borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5 mb-1">
          <AlertTriangle size={16} style={{ color: 'var(--gold)' }} />
          <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--bg)', fontFamily: 'Fraunces, serif' }}>
            Risk Screener
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>
          Expert.ai · Group 18
        </p>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--bg)' : 'var(--ink-mute)',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--bg)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--ink-mute)' }}
            >
              <Icon size={15} />
              <span style={{ letterSpacing: '0.02em' }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--ink-mute)', letterSpacing: '0.03em' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>LightGBM · 2022–2023</p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', marginTop: '2px' }}>ROC-AUC 0.938 · F1 0.140</p>
      </div>
    </aside>
  )
}
