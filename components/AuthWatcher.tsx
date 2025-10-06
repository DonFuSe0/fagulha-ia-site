'use client'
// components/AuthWatcher.tsx — evita vazamento de listeners com cleanup
import { useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

export default function AuthWatcher() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      // sua lógica de resposta de auth aqui se quiser
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  return null
}