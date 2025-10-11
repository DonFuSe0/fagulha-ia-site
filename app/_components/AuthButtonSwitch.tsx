// app/_components/AuthButtonSwitch.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  className?: string
  loginHref?: string
  profileHref?: string
  labelLogin?: string
  labelProfile?: string
}

export default function AuthButtonSwitch({
  className,
  loginHref = '/auth/login',
  profileHref = '/dashboard',
  labelLogin = 'Entrar',
  labelProfile = 'Perfil',
}: Props) {
  const supabase = createClientComponentClient()
  const [isLogged, setIsLogged] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setIsLogged(!!data.session?.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session?.user)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [supabase])

  if (isLogged === null) return null

  return !isLogged ? (
    <Link href={loginHref} className={className}> {labelLogin} </Link>
  ) : (
    <Link href={profileHref} className={className}> {labelProfile} </Link>
  )
}
