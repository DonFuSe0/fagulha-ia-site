'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Profile = { nickname?: string | null, avatar_url?: string | null }

export default function Header() {
  const [nickname, setNickname] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: sess } = await supabase.auth.getSession()
      const user = sess.session?.user
      if (!user) { if (mounted) { setNickname(null); setAvatarUrl(null) }; return }
      const { data: profile } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', user.id).maybeSingle()
      const nick = profile?.nickname || user.user_metadata?.nickname || (user.email?.split('@')[0] ?? 'Você')
      if (mounted) { setNickname(nick); setAvatarUrl(profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null) }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <nav className="w-full bg-black/60 backdrop-blur border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight">Fagulha<span className="text-brand">.</span></Link>
          <Link href="/gallery" className="hover:text-brand hidden sm:inline-block">Explorar</Link>
          <Link href="/generate" className="hover:text-brand hidden sm:inline-block">Criação</Link>
        </div>

        {/* Right side */}
        {nickname ? (
          <div className="relative">
            <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-1 hover:border-brand transition-colors">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                {avatarUrl ? <Image src={avatarUrl} alt={nickname} width={32} height={32} /> : <span className="text-xs text-zinc-400">AV</span>}
              </div>
              <span className="text-sm text-zinc-200">{nickname}</span>
              <svg className={'w-4 h-4 text-zinc-400 transition-transform ' + (open ? 'rotate-180' : '')} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900/95 shadow-xl backdrop-blur">
                <div className="py-2 text-sm">
                  <Link href="/gallery" className="block px-4 py-2 hover:bg-zinc-800">Sua Galeria</Link>
                  <Link href="/settings?tab=perfil" className="block px-4 py-2 hover:bg-zinc-800">Editar Perfil</Link>
                  <Link href="/planos" className="block px-4 py-2 hover:bg-zinc-800">Adquirir Tokens</Link>
                  <button
                    onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-red-400"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hover:text-brand">Entrar</Link>
            <Link href="/gallery" className="hover:text-brand">Explorar</Link>
            <Link href="/planos" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium">Adquirir Tokens</Link>
          </div>
        )}
      </div>
    </nav>
  )
}