// app/_components/ProfileHero.tsx
'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ProfileHero() {
  const supabase = createClientComponentClient()
  const [name, setName] = useState<string>('Meu perfil')
  const [uid, setUid] = useState<string | null>(null)
  const [tick, setTick] = useState<number>(Date.now())

  // carrega nome e uid
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [{ data: { user } }, { data: profile }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('profiles').select('full_name, username').maybeSingle(),
      ])
      if (!mounted) return
      setUid(user?.id ?? null)
      const display = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Meu perfil'
      setName(display || 'Meu perfil')
    })()

    // quando a sessão muda (updateUser com avatar_ver), força refresh do endpoint
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setTick(Date.now())
    })

    // escuta o evento do upload e força atualização
    const handler = () => setTick(Date.now())
    window.addEventListener('avatar:updated', handler as any)

    return () => {
      sub.subscription.unsubscribe()
      window.removeEventListener('avatar:updated', handler as any)
      mounted = false
    }
  }, [supabase])

  const src = useMemo(() => {
    if (!uid) return '/avatar-placeholder.png'
    // bate no endpoint que redireciona SEM cache para a URL atual do avatar
    return `/api/profile/avatar-url?uid=${encodeURIComponent(uid)}&t=${tick}`
  }, [uid, tick])

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
