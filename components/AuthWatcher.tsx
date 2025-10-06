'use client'
// components/AuthWatcher.tsx — previne múltiplas subscrições
import { useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

declare global {
  interface Window { __authWatcherMounted?: boolean }
}

export default function AuthWatcher() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.__authWatcherMounted) {
        // já montado em outro ponto (evita múltiplas inscrições)
        return
      }
      window.__authWatcherMounted = true
    }

    const supabase = getSupabaseBrowserClient()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      // sua lógica se necessário
    })

    return () => {
      sub.subscription.unsubscribe()
      if (typeof window !== 'undefined') {
        window.__authWatcherMounted = false
      }
    }
  }, [])

  return null
}