// app/settings/layout.tsx
import Link from 'next/link'
import type { ReactNode } from 'react'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Top bar with back button */}
      <div className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 border border-zinc-800 hover:bg-zinc-900 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
            <span className="text-sm text-zinc-400">Configurações</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
