// app/dashboard/page.tsx
'use client'

import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [nickname, setNickname] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [credits, setCredits] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile/credits', { credentials: 'include' })
        const data = await res.json()
        if (!cancelled && res.ok) {
          setNickname(data.nickname || '')
          setAvatarUrl(data.avatar_url || '')
          setCredits(typeof data.credits === 'number' ? data.credits : 0)
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || '/avatars/fire-1.png'} alt="avatar" className="h-10 w-10 object-cover"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-200">{nickname || 'Seu perfil'}</span>
            <span className="ml-1 text-xs text-white/80 bg-white/10 border border-white/10 rounded px-2 py-0.5">
              Saldo: <strong>{credits}</strong>
            </span>
          </div>
        </div>

        <a href="/settings?tab=perfil" className="text-sm text-zinc-300 hover:text-white">
          Editar perfil
        </a>
      </div>

      <div className="text-zinc-400 text-sm">
        <p>Conteúdos do seu dashboard permanecem aqui (histórico de tokens, últimas criações, etc.).</p>
      </div>
    </div>
  )
}
