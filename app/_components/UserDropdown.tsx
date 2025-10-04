'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserDropdown() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const router = useRouter()

  // Fecha em clique fora
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node
      if (menuRef.current && !menuRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setOpen(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (_) {
      // ignore
    } finally {
      setOpen(false)
      router.replace('/')
    }
  }

  // Qualquer clique em item fecha o menu
  function closeAnd<T extends React.MouseEvent>(fn?: () => void) {
    return (e: T) => {
      setOpen(false)
      fn?.()
    }
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md px-3 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20 transition"
      >
        Perfil
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-lg bg-white/95 text-black shadow-lg ring-1 ring-black/5 backdrop-blur-sm"
        >
          <div className="py-1">
            <Link
              href="/perfil"
              role="menuitem"
              onClick={closeAnd()}
              className="block px-3 py-2 text-sm hover:bg-black/5"
              prefetch
            >
              Meu perfil
            </Link>

            <Link
              href="/settings"
              role="menuitem"
              onClick={closeAnd()}
              className="block px-3 py-2 text-sm hover:bg-black/5"
              prefetch
            >
              Configurações
            </Link>

            <Link
              href="/dashboard"
              role="menuitem"
              onClick={closeAnd()}
              className="block px-3 py-2 text-sm hover:bg-black/5"
              prefetch
            >
              Histórico de tokens
            </Link>

            <button
              role="menuitem"
              onClick={closeAnd(handleLogout)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-black/5"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
