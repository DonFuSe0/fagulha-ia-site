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

  return (
    <header className="sticky top-0 z-40 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-white font-semibold">Fagulha</Link>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/explorar" className="text-white/80 hover:text-white text-sm">Explorar</Link>
          <Link href="/gallery" className="text-white/80 hover:text-white text-sm">Minha galeria</Link>
          <Link href="/settings" className="text-white/80 hover:text-white text-sm">Configurações</Link>

          {user ? (
            <div className="relative group">
              {/* Trigger */}
              <div className="flex items-center gap-2 cursor-pointer select-none">
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10">
                  <Image
                    src={(user as any).user_metadata?.avatar_url || fallbackAvatarFor(user.id)}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-white/90 text-sm">{(user as any).user_metadata?.nickname || (user.email?.split('@')[0] ?? 'Usuário')}</span>
                <IconChevronDown className="text-white/60" />
              </div>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-neutral-900/90 border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                <Link href="/settings?tab=perfil" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10">
                  <IconSettings /> <span>Editar perfil</span>
                </Link>
                <Link href="/settings?tab=tokens" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10">
                  <IconSettings /> <span>Comprar tokens</span>
                </Link>
                <Link href="/explorar" className="flex items-center gap-2 px-3 py-2 text-white/90 hover:bg-white/10">
                  <IconGallery /> <span>Galeria pública</span>
                </Link>
                <Link href="/api/auth/logout" className="flex items-center gap-2 px-3 py-2 text-red-300 hover:bg-white/10">
                  <IconLogout /> <span>Sair</span>
                </Link>
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
