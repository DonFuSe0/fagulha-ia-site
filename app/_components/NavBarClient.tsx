'use client'
// app/_components/NavBarClient.tsx — seguro: sem onAuthStateChange acumulando
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
    <nav className="w-full bg-black/60 backdrop-blur border-b border-gray-800 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Fagulha<span className="text-orange-500">.</span></Link>
        <div className="flex items-center gap-4">
          {session ? (
            <Link href="/perfil" className="hover:text-orange-400">Meu Perfil</Link>
          ) : (
            <Link href="/auth/login" className="hover:text-orange-400">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  )
}