// app/_components/UserMenu.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { IconGallery, IconSettings, IconLogout } from './icons'

type Props = {
  isLogged: boolean
  avatarSrc?: string
  nickname?: string
  credits?: number
}

export default function UserMenu({ isLogged, avatarSrc='/avatars/fire-1.png', nickname='Usuário', credits }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  if (!isLogged) {
    return <Link href="/auth/login" className="text-white/80 hover:text-white text-sm">Entrar</Link>
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 cursor-pointer select-none rounded-full pl-2 pr-2.5 py-1 hover:bg-white/10">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/15">
          <Image src={avatarSrc} alt="avatar" fill className="object-cover" />
        </div>
        <span className="text-white/90 text-sm max-w-[140px] truncate">{nickname}</span>
        {typeof credits === 'number' && (
          <span className="ml-1 inline-flex items-center rounded-full bg-white/10 border border-white/15 px-2 py-[2px] text-[11px] text-white/80">
            {credits} <span className="ml-1 text-white/50">tokens</span>
          </span>
        )}
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/60"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900/95 border border-white/10 shadow-xl p-1">
          <Link href="/settings?tab=perfil" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg">
            <IconSettings /> <span>Editar perfil</span>
          </Link>
          <Link href="/settings?tab=seguranca" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg">
            <IconSettings /> <span>Alterar senha</span>
          </Link>
          <Link href="/settings?tab=tokens" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg">
            <IconSettings /> <span>Tokens</span>
          </Link>
          <Link href="/gallery" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg">
            <IconGallery /> <span>Minha galeria</span>
          </Link>
          <div className="h-px bg-white/10 my-1" />
          <form action="/api/auth/logout" method="POST">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-red-300 hover:bg-white/10 rounded-lg">
              <IconLogout /> <span>Sair</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
