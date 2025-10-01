'use client'
import Image from 'next/image'
import { defaultAvatarFor } from '@/lib/utils/avatar'

type Props = {
  userId: string
  email: string
  nickname: string | null
  avatarUrl: string | null
  credits: number
}

export default function ProfileCard({ userId, email, nickname, avatarUrl, credits }: Props) {
  const fallback = defaultAvatarFor(userId)
  const name = nickname ?? (email?.split('@')[0] ?? 'Usuário')
  return (
    <div className="rounded-2xl p-5 bg-neutral-900/50 border border-neutral-800 flex items-center gap-4">
      <div className="relative w-16 h-16 overflow-hidden rounded-full ring-1 ring-white/10">
        <Image src={avatarUrl || fallback} alt="Avatar" fill className="object-cover" />
      </div>
      <div className="flex-1">
        <div className="text-white font-medium text-lg">{name}</div>
        <div className="text-neutral-400 text-sm">{email}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-neutral-400">Saldo</div>
        <div className="text-2xl font-semibold text-white">{credits}</div>
        <div className="text-xs text-neutral-400">tokens</div>
      </div>
    </div>
  )
}
