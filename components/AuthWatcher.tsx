'use client'
import { useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

declare global { interface Window { __authWatcherMounted?: boolean } }

export default function AuthWatcher() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.__authWatcherMounted) return
      window.__authWatcherMounted = true
    }

    const supabase = getSupabaseBrowserClient()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      // opcional: navegação pós-login, logs, etc.
    })

    return () => {
      sub.subscription.unsubscribe()
      if (typeof window !== 'undefined') window.__authWatcherMounted = false
    }
  }, [])

  return null
}