// app/_components/ProfileHero.tsx
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type ProfileRow = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

export default function ProfileHero() {
  const supabase = createClientComponentClient()
  const [name, setName] = useState<string>('Meu perfil')
  const [src, setSrc] = useState<string>('/avatar-placeholder.png')
  const [uid, setUid] = useState<string | null>(null)

  // Carrega user e o profile CORRETO (filtrando por id)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      const userId = user?.id || null
      setUid(userId)

      // Se não houver usuário autenticado, mantemos placeholder
      if (!userId) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', userId)
        .maybeSingle() as unknown as { data: ProfileRow | null }

      const display =
        profile?.full_name ||
        profile?.username ||
        user?.email?.split('@')[0] ||
        'Meu perfil'
      setName(display)

      // Preferimos sempre a URL do profile (já deve vir com ?v=)
      let url = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || null
      const ver = (user?.user_metadata as any)?.avatar_ver

      if (url) {
        const sep = url.includes('?') ? '&' : '?'
        setSrc(ver ? `${url}${sep}v=${encodeURIComponent(String(ver))}` : url)
      }
    })()

    return () => { mounted = false }
  }, [supabase])

  // Reage a mudanças da sessão (updateUser com avatar_ver)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const meta = session?.user?.user_metadata as any
      const url = meta?.avatar_url as string | undefined
      const ver = meta?.avatar_ver
      if (url) {
        const sep = url.includes('?') ? '&' : '?'
        setSrc(ver ? `${url}${sep}v=${encodeURIComponent(String(ver))}` : url)
      }
    })
    return () => { sub.subscription.unsubscribe() }
  }, [supabase])

  // Reage ao evento do upload
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as any
      const url = detail?.url as string | undefined
      const ver = detail?.ver
      if (url) {
        const sep = url.includes('?') ? '&' : '?'
        setSrc(ver ? `${url}${sep}v=${encodeURIComponent(String(ver))}` : url)
      }
    }
    window.addEventListener('avatar:updated', handler as any)
    return () => window.removeEventListener('avatar:updated', handler as any)
  }, [])

  return (
    <section className="w-full max-w-5xl mx-auto py-6 px-4 flex items-center gap-4">
      <Image
        key={src}
        src={src}
        alt="Avatar"
        width={96}
        height={96}
        className="h-24 w-24 rounded-full object-cover ring-1 ring-white/10"
        unoptimized
      />
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-white">{name}</h1>
        <p className="text-sm text-white/60">Bem-vindo ao seu perfil</p>
      </div>
    </section>
  )
}
