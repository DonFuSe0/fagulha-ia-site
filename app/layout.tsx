// app/layout.tsx
import type { ReactNode } from 'react'
import Link from 'next/link'
import './globals.css'
import NavBarClient from './_components/NavBarClient'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-black text-white antialiased">
        <header className="w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <div className="mr-auto">
              <Link href="/" className="text-lg font-semibold tracking-wide hover:opacity-80 transition" prefetch>
                Fagulha<span className="text-orange-400">IA</span>
              </Link>
            </div>
            <NavBarClient />
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="w-full py-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Fagulha IA
        </footer>
      </body>
    </html>
  )
}
