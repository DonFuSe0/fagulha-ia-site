// app/_components/ProfileHero.tsx
'use client'

// Torna o ProfileHero 100% client-side para refletir o avatar imediatamente
// sem cache de Server Components. Lê direto de `profiles` e da sessão,
// escuta onAuthStateChange e o evento `avatar:updated`.

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type ProfileRow = {
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

export default function ProfileHero() {
  const supabase = createClientComponentClient()
  const [name, setName] = useState<string>('Meu perfil')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Carrega dados atuais do usuário + profile
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [{ data: { user } }, { data: profile }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('profiles').select('full_name, username, avatar_url').maybeSingle() as any,
      ])

      if (!mounted) return

      const display =
        (profile?.full_name as string) ||
        (profile?.username as string) ||
        (user?.email?.split('@')[0] ?? 'Meu perfil')
      setName(display)

      // preferimos SEMPRE a URL do profile (ela já deve vir com ?v=timestamp)
      let url = (profile?.avatar_url as string) || (user?.user_metadata as any)?.avatar_url || null

      // se não tiver ?v=, tenta ler do user_metadata
      const ver = (user?.user_metadata as any)?.avatar_ver
      if (url && ver && !/[?&]v=/.test(url)) {
        const sep = url.includes('?') ? '&' : '?'
        url = `${url}${sep}v=${encodeURIComponent(String(ver))}`
      }
      setAvatarUrl(url)
    })()

    // Atualiza ao mudar a sessão (ex.: updateUser com avatar_ver)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const meta = session?.user?.user_metadata as any
      const url = meta?.avatar_url as string | undefined
      const ver = meta?.avatar_ver
      if (url) {
        const sep = url.includes('?') ? '&' : '?'
        setAvatarUrl(ver ? `${url}${sep}v=${encodeURIComponent(String(ver))}` : url)
      }
    })

    // Atualiza ao receber o evento do upload
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as any
      const url = detail?.url as string | undefined
      const ver = detail?.ver
      if (url) {
        const sep = url.includes('?') ? '&' : '?'
        setAvatarUrl(ver ? `${url}${sep}v=${encodeURIComponent(String(ver))}` : url)
      }
    }
    window.addEventListener('avatar:updated', handler as any)

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
      window.removeEventListener('avatar:updated', handler as any)
    }
  }, [supabase])

  const src = avatarUrl || '/avatar-placeholder.png'

  return (
    <section className="w-full max-w-5xl mx-auto py-6 px-4 flex items-center gap-4">
      <Image
        key={src}
        src={src}
        alt="Avatar"
        width={96}
        height={96}
        className="h-24 w-24 rounded-full object-cover ring-1 ring-white/10"
      />
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-white">{name}</h1>
        <p className="text-sm text-white/60">Bem-vindo ao seu perfil</p>
      </div>
    </section>
  )
}
