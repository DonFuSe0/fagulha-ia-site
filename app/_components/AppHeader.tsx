// app/_components/AppHeader.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browserClient'

export default function AppHeader() {
  const [open, setOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<{ id: string; email?: string | null; user_metadata?: any } | null>(null)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      const { data } = await supabaseBrowser.auth.getSession()
      if (!mounted) return
      setSessionUser(data.session?.user ?? null)
    }
    run()
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_event, s) => {
      setSessionUser(s?.user ?? null)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const isActive = (href: string) => pathname?.startsWith(href)

  const avatarUrl = (() => {
    const raw = (sessionUser?.user_metadata as any)?.avatar_url as string | undefined
    const ver = (sessionUser?.user_metadata as any)?.avatar_ver
    if (!raw) return undefined
    const sep = raw.includes('?') ? '&' : '?'
    return ver ? `${raw}${sep}v=${encodeURIComponent(String(ver))}` : raw
  })()

  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* seu logo e marca existentes */}
          <span className="text-lg font-semibold">Fagulha</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/explorar" className={isActive('/explorar') ? 'text-white' : 'text-zinc-300 hover:text-white'}>Explorar</Link>
          <Link href="/gallery" className={isActive('/gallery') ? 'text-white' : 'text-zinc-300 hover:text-white'}>Sua Galeria</Link>
          <Link href="/planos" className={isActive('/planos') ? 'text-white' : 'text-zinc-300 hover:text-white'}>Planos</Link>
        </nav>

        {/* Lado direito: Entrar ou Avatar */}
        {!sessionUser ? (
          <Link href="/auth/login" className="inline-flex items-center rounded-md border border-white/10 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm">
            Entrar
          </Link>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={"inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 px-2 py-1"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl || '/avatar-placeholder.png'}
                alt="Avatar"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="text-sm text-zinc-200">Perfil</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-black/90 backdrop-blur border border-white/10 shadow-lg p-2">
                <Link className="block px-3 py-2 rounded hover:bg-white/10" href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link className="block px-3 py-2 rounded hover:bg-white/10" href="/gallery" onClick={() => setOpen(false)}>Minha galeria</Link>
                <Link className="block px-3 py-2 rounded hover:bg-white/10" href="/settings?tab=perfil" onClick={() => setOpen(false)}>Editar perfil</Link>
                <Link className="block px-3 py-2 rounded hover:bg-white/10" href="/settings?tab=seguranca" onClick={() => setOpen(false)}>Alterar senha</Link>
                <Link className="block px-3 py-2 rounded hover:bg-white/10" href="/planos" onClick={() => setOpen(false)}>Adquirir tokens</Link>
                <Link className="block px-3 py-2 rounded hover:bg-white/10" href="/auth/logout" onClick={() => setOpen(false)}>Sair</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
