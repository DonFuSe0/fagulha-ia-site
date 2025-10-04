'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import UserDropdown from './UserDropdown'
import { createClient } from '@/lib/supabase/client' // usa o seu helper atual

export default function NavBarClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setIsLoggedIn(!!data.session)
    })

    // escuta mudanças de auth
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <nav className="ml-auto flex items-center gap-5">
      {/* Sempre visíveis quando deslogado */}
      {!isLoggedIn && (
        <>
          <Link
            href="/auth/login"
            className="text-sm font-medium hover:opacity-80 transition"
            prefetch
          >
            Entrar
          </Link>
          <Link
            href="/explorar"
            className="text-sm font-medium hover:opacity-80 transition"
            prefetch
          >
            Explorar
          </Link>
          <Link
            href="/planos"
            className="text-sm font-medium hover:opacity-80 transition"
            prefetch
          >
            Planos
          </Link>
        </>
      )}

      {/* Quando logado: Explorar, Planos e Dropdown Perfil */}
      {isLoggedIn && (
        <>
          <Link
            href="/explorar"
            className="text-sm font-medium hover:opacity-80 transition"
            prefetch
          >
            Explorar
          </Link>
          <Link
            href="/planos"
            className="text-sm font-medium hover:opacity-80 transition"
            prefetch
          >
            Planos
          </Link>

          <UserDropdown />
        </>
      )}
    </nav>
  )
}
