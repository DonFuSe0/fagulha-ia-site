'use client'
// app/_components/NavBarClient.tsx — sem onAuthStateChange (evita listeners)
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export default function NavBarClient() {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null)
    })
    return () => { mounted = false }
  }, [supabase])

  return (
    <nav className="w-full flex items-center justify-between p-3">
      <Link href="/">Fagulha</Link>
      <div className="flex items-center gap-3">
        {session ? (
          <Link href="/perfil">Meu Perfil</Link>
        ) : (
          <Link href="/auth/login">Entrar</Link>
        )}
      </div>
    </nav>
  )
}