'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Search, AlertTriangle, FlaskConical } from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/screener', label: 'Screener', icon: Search },
  { href: '/assess', label: 'Assess', icon: FlaskConical },
]

export default function Nav() {
  const path = usePathname()
  return (
    <aside className="w-[220px] shrink-0 bg-zinc-900 text-zinc-300 flex flex-col h-full">
      <div className="px-5 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-indigo-400" />
          <span className="text-white font-semibold text-sm">Risk Screener</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Expert.ai · Group 18</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-zinc-800 text-xs text-zinc-600">
        <p>LightGBM · 2022–2023</p>
        <p>ROC-AUC 0.938 · F1 0.140</p>
      </div>
    </aside>
  )
}
