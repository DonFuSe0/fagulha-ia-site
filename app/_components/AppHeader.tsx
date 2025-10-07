// app/_components/AppHeader.tsx
'use client'

import Link from 'next/link'
import React from 'react'
import CreditsBadge from '@/app/_components/CreditsBadge'

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">Fagulha</Link>
          <nav className="hidden md:flex items-center gap-3 text-sm text-zinc-300">
            <Link href="/" className="hover:text-white">Início</Link>
            <Link href="/gallery" className="hover:text-white">Sua Galeria</Link>
            <Link href="/generate" className="hover:text-white">Criação</Link>
            <Link href="/explore" className="hover:text-white">Explorar</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CreditsBadge />
          {/* Avatar + Nick (seu dropdown atual permanece aqui) */}
          <Link href="/settings?tab=perfil" className="rounded-full w-8 h-8 bg-zinc-800 grid place-items-center text-xs">ME</Link>
        </div>
      </div>
    </header>
  )
}
