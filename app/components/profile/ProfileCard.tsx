// app/components/profile/ProfileCard.tsx
'use client'
import { useState } from 'react'

type Props = {
  userId: string
  email: string
  nickname: string | null
  avatarUrl: string | null
  credits: number
}

function defaultAvatarFor(userId: string) {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = ((h<<5)-h)+userId.charCodeAt(i)|0
  const idx = Math.abs(h) % 4
  return `/avatars/fire-${idx+1}.png`
}

export default function ProfileCard({ userId, email, nickname, avatarUrl, credits }: Props) {
  const [src, setSrc] = useState<string>(avatarUrl || defaultAvatarFor(userId))
  const name = nickname ?? (email?.split('@')[0] ?? 'Usuário')
  function handleErr() {
    const idx = Math.abs(userId.split('').reduce((a,c)=>((a<<5)-a)+c.charCodeAt(0)|0,0)) % 4
    setSrc(`/avatars/fire-${idx+1}.svg`)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(1200px_400px_at_-200px_-200px,rgba(255,255,255,.08),transparent)]">
      <div className="p-5 flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} onError={handleErr} alt="Avatar" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-xl truncate">{name}</div>
          <div className="text-neutral-400 text-sm truncate">{email}</div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a href="/settings?tab=perfil" className="px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/90 hover:bg-white/12">Editar perfil</a>
            <a href="/settings?tab=seguranca" className="px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/90 hover:bg-white/12">Alterar senha</a>
            <a href="/gallery" className="px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/90 hover:bg-white/12">Minha galeria</a>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-neutral-400">Saldo</div>
          <div className="text-3xl font-semibold text-white tracking-tight">{credits}</div>
          <div className="text-xs text-neutral-400">tokens</div>
        </div>
      </div>
    </div>
  )
}
