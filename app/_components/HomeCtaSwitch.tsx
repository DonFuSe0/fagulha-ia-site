// app/_components/HomeCtaSwitch.tsx
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function HomeCtaSwitch({ className }: { className?: string }){
  const supabase = createClientComponentClient()
  const [isLogged, setIsLogged] = useState<boolean | null>(null)
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => { if(!mounted) return; setIsLogged(!!data.session?.user) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setIsLogged(!!s?.user))
    return () => { sub.subscription.unsubscribe(); mounted = false }
  }, [supabase])
  if (isLogged === null) return null
  return isLogged ? (
    <Link href="/dashboard" className={className}>Perfil</Link>
  ) : (
    <Link href="/auth/login" className={className}>Entrar</Link>
  )
}
