// app/_components/NavBarClient.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import UserDropdown from './UserDropdown'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function NavBarClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setIsLoggedIn(Boolean(data.session))
    })()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsLoggedIn(Boolean(session))
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <nav className="ml-auto flex items-center gap-5">
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
