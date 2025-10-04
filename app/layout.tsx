// app/layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'
import './globals.css'  // seu CSS global

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* outros meta ou links como favicon */}
      </head>
      <body className="bg-black text-white min-h-screen">
        <header className="w-full p-4 bg-gray-900 flex justify-between items-center">
          <Link href="/">Home</Link>
          <nav className="space-x-4">
            <Link href="/auth/login">Entrar</Link>
            <Link href="/explorar">Explorar</Link>
            <Link href="/planos">Planos</Link>
          </nav>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
