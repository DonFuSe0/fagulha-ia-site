'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthSessionSync() {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        await fetch('/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ event, session })
        })
      } catch {}
    })

    ;(async () => {
      try {
        await supabase.auth.getSession()
      } catch {}
    })()

    return () => subscription.unsubscribe()
  }, [supabase])

  return null
}
