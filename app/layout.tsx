import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Bankruptcy Risk Screener · Expert.ai',
  description: 'Credit risk screening tool powered by LightGBM bankruptcy prediction model',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex">
        <Nav />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  )
}
