// app/auth/debug/page.tsx — Diagnóstico: inclui apikey para evitar 401 nos /auth/v1/settings
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthDebug() {
  const [status, setStatus] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
        const ping = await fetch(`${url}/auth/v1/settings`, {
          headers: { apikey: anon },
        })
        const json = await ping.json().catch(() => ({}))
        const { data } = await supabase.auth.getSession()
        setSession(data?.session ?? null)
        setStatus({ url, anon: anon ? 'present' : 'missing', http: ping.status, settings: json })
      } catch (e: any) {
        setError(e?.message || String(e))
      }
    }
    run()
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto text-sm">
      <h1 className="text-xl font-semibold">Auth Debug</h1>
      {error && <p className="text-red-500">{error}</p>}
      <pre className="whitespace-pre-wrap break-words bg-black/40 border border-zinc-800 rounded p-3 mt-4">{JSON.stringify({ status, session }, null, 2)}</pre>
    </div>
  )
}