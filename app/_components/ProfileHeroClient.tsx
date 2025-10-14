// app/_components/ProfileHeroClient.tsx
'use client'

import Image from 'next/image'
import { publicAvatarUrl } from '@/lib/utils/avatar'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  name: string
  avatarUrl: string | null
}

export default function ProfileHeroClient({ name, avatarUrl }: Props) {
  const supabase = createClientComponentClient()
  const [src, setSrc] = useState<string | null>(avatarUrl)

  // Quando a sessão mudar (ex.: updateUser com avatar_ver), tentamos atualizar a URL também
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

  // Também escutamos um evento custom para atualização imediata pós-upload
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

  // Se nada disso acontecer, mas o server já mandou profiles.avatar_url com ?v=, mantemos.
  const fallback = publicAvatarUrl(src) || '/avatar-placeholder.png'

  return (
    <section className="w-full max-w-5xl mx-auto py-6 px-4 flex items-center gap-4">
      <Image
        key={fallback}
        src={fallback}
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
