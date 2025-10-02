// app/_components/AppHeader.tsx
import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import UserMenu from './UserMenu'

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

  const avatarSrc = avatarUrl || (user ? fallbackAvatarFor(user!.id) : '/avatars/fire-1.png')

  return (
    <header className="sticky top-0 z-40 bg-[linear-gradient(180deg,rgba(6,6,6,.7),rgba(6,6,6,.5))] backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-white font-semibold tracking-tight">Fagulha IA</Link>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/explorar" className="text-white/80 hover:text-white text-sm">Explorar</Link>
          <Link href="/gallery" className="text-white/80 hover:text-white text-sm">Galeria</Link>
          <Link href="/dashboard" className="text-white/80 hover:text-white text-sm">Dashboard</Link>

          <UserMenu
            isLogged={!!user}
            avatarSrc={avatarSrc}
            nickname={nickname ?? undefined}
            credits={typeof credits === 'number' ? credits : undefined}
          />
        </nav>
      </div>
    </header>
  )
}
