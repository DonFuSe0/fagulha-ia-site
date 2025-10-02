// app/_components/AppHeader.tsx
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { IconChevronDown, IconGallery, IconSettings, IconLogout } from '../_components/icons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function fallbackAvatarFor(userId: string) {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = ((h<<5)-h)+userId.charCodeAt(i)|0
  const idx = Math.abs(h) % 4
  return `/avatars/fire-${idx+1}.png`
}

export default async function AppHeader() {
  const supabase = createServerComponentClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let avatarUrl: string | null = null
  let nickname: string | null = null
  let credits: number | null = null

  if (user) {
    const [{ data: profile }, { data: rpc }] = await Promise.all([
      supabase.from('profiles').select('avatar_url, nickname, credits').eq('id', user.id).single(),
      supabase.rpc('current_user_credits')
    ])
    nickname = profile?.nickname ?? (user.email?.split('@')[0] ?? null)
    const rawAvatar = profile?.avatar_url ?? null
    avatarUrl = rawAvatar ? `${rawAvatar}${rawAvatar.includes('?') ? '&' : '?'}v=${Date.now()}` : null
    credits = (typeof rpc === 'number' ? rpc : null) ?? (profile?.credits ?? null)
  }

  const avatarSrc = avatarUrl || (user ? fallbackAvatarFor(user.id) : '/avatars/fire-1.png')

  return (
    <header className="sticky top-0 z-40 bg-[linear-gradient(180deg,rgba(6,6,6,.7),rgba(6,6,6,.5))] backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-white font-semibold tracking-tight">Fagulha IA</Link>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/explorar" className="text-white/80 hover:text-white text-sm">Explorar</Link>
          <Link href="/gallery" className="text-white/80 hover:text-white text-sm">Galeria</Link>
          <Link href="/dashboard" className="text-white/80 hover:text-white text-sm">Dashboard</Link>

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 cursor-pointer select-none rounded-full pl-2 pr-2.5 py-1 hover:bg-white/10">
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/15">
                  <Image
                    src={avatarSrc}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-white/90 text-sm max-w-[140px] truncate">{nickname ?? 'Usuário'}</span>
                {typeof credits === 'number' && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-white/10 border border-white/15 px-2 py-[2px] text-[11px] text-white/80">
                    {credits} <span className="ml-1 text-white/50">tok</span>
                  </span>
                )}
                <IconChevronDown className="text-white/60" />
              </button>
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900/95 border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                <Link href="/settings?tab=perfil" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10">
                  <IconSettings /> <span>Editar perfil</span>
                </Link>
                <Link href="/settings?tab=seguranca" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10">
                  <IconSettings /> <span>Alterar senha</span>
                </Link>
                <Link href="/settings?tab=tokens" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10">
                  <IconSettings /> <span>Tokens</span>
                </Link>
                <Link href="/gallery" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10">
                  <IconGallery /> <span>Minha galeria</span>
                </Link>
                <div className="h-px bg-white/10 my-1" />
                <form action="/api/auth/logout" method="POST">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-red-300 hover:bg-white/10">
                    <IconLogout /> <span>Sair</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="text-white/80 hover:text-white text-sm">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
