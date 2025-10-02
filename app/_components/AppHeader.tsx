'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browserClient'

export default function AppHeader() {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  // Fetch auth session (client)
  useEffect(() => {
    const run = async () => {
      const { data } = await supabaseBrowser.auth.getSession()
      setUserId(data.session?.user?.id ?? null)
    }
    run()
  }, [])

  // Close when route changes
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on outside click & ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onSelect = () => setOpen(false)

  return (
    <header className="flex items-center gap-4 p-4 border-b border-white/10">
      <Link href="/" className="font-bold">Fagulha</Link>

      {/* Right side nav */}
      <div className="ml-auto flex items-center gap-2">
        {/* Always visible links (Entrar -> Perfil quando logado) */}
        <nav className="flex items-center gap-2">
          {userId
            ? <Link href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-white/10">Perfil</Link>
            : <Link href="/entrar"    className="px-3 py-2 rounded-lg hover:bg-white/10">Entrar</Link>
          }
          <Link href="/explorar" className="px-3 py-2 rounded-lg hover:bg-white/10">Explorar</Link>
          <Link href="/planos"   className="px-3 py-2 rounded-lg hover:bg-white/10">Planos</Link>
        </nav>

        {/* Dropdown only when logged-in */}
        {userId && (
          <div className="relative" ref={menuRef}>
            <button
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setOpen(o => !o)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
            >
              Menu
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-xl bg-black/90 backdrop-blur border border-white/10 shadow-lg p-2"
              >
                <Link href="/gallery" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Minha galeria</Link>
                <Link href="/settings?tab=perfil" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Editar perfil</Link>
                <Link href="/settings?tab=seguranca" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Alterar senha</Link>
                <Link href="/planos" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Adquirir tokens</Link>
                <Link href="/auth/logout" onClick={onSelect} role="menuitem" className="block px-3 py-2 rounded hover:bg-white/10">Sair</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
