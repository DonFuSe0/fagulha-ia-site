'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browserClient'

export default function AppHeader() {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [nickname, setNickname] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile/credits', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) { setCredits(data.credits ?? 0); setNickname(data.nickname || ''); setAvatarUrl(data.avatar_url || ''); }
      } catch {}
    })();
    const run = async () => {
      const { data } = await supabaseBrowser.auth.getSession()
      setUserId(data.session?.user?.id ?? null)
    }
    run()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile/credits', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) { setCredits(data.credits ?? 0); setNickname(data.nickname || ''); setAvatarUrl(data.avatar_url || ''); }
      } catch {}
    })(); setOpen(false) }, [pathname])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile/credits', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) { setCredits(data.credits ?? 0); setNickname(data.nickname || ''); setAvatarUrl(data.avatar_url || ''); }
      } catch {}
    })();
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onSelect = () => setOpen(false)

  return (
    <header className="flex items-center gap-4 p-4 border-b border-white/10">
      <Link href="/" className="font-bold">Fagulha</Link>

      <div className="ml-auto flex items-center gap-2">
        <nav className="flex items-center gap-2">
          {userId
            ? <Link href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-white/10">Perfil</Link>
            : <Link href="/auth/login" className="px-3 py-2 rounded-lg hover:bg-white/10">Entrar</Link>
          }
          <Link href="/explore" className="px-3 py-2 rounded-lg hover:bg-white/10">Explorar</Link>
          <Link href="/planos" className="px-3 py-2 rounded-lg hover:bg-white/10">Planos</Link>
        </nav>

        {userId && (
          <div className="relative" ref={menuRef}>
            <button
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 rounded-full pl-2 pr-2.5 py-1 hover:bg-white/10"
            >
              <span className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl || '/avatars/fire-1.png'} alt="avatar" className="h-8 w-8 object-cover"/>
              </span>
              <span className="max-w-[140px] truncate text-sm text-white/90">{nickname || 'Perfil'}</span>
              {typeof credits === "number" && (
                <span className="ml-1 inline-flex items-center rounded-md border border-white/15 bg-white/10 px-2 py-[2px] text-[11px] text-white/80">
                  {credits} <span className="ml-1 text-white/50">tokens</span>
                </span>
              )}
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/60"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-xl bg-black/90 backdrop-blur border border-white/10 shadow-lg p-2"
              >
                <Link href="/gallery" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Minha galeria</Link>
                <Link href="/settings?tab=perfil" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Editar perfil</Link>
                <Link href="/settings?tab=seguranca" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Alterar senha</Link>
                <Link href="/planos" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Adquirir tokens</Link>
                <Link href="/auth/logout" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Sair</Link>
              </div>
            )}
          <div className="hidden sm:flex items-center gap-2 pr-2">
            {typeof credits === 'number' && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/90">
                Saldo: <strong className="ml-1">{credits}</strong>
              </span>
            )}
          </div>
        </div>
        )}
      </div>
    </header>
  )
}
