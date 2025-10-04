import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import './globals.css'
import NavBarClient from './_components/NavBarClient'

export const metadata: Metadata = {
  title: 'Fagulha IA',
  description: 'Gerador e galeria – Fagulha IA',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Captura a nonce enviada pelo middleware e injeta como <meta>
  const nonce = headers().get('x-nonce') ?? undefined

  return (
    <html lang="pt-BR">
      <head>
        {nonce ? <meta name="csp-nonce" content={nonce} /> : null}
      </head>
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
