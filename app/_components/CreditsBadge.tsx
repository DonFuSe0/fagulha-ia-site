// app/_components/CreditsBadge.tsx
'use client'

import React from 'react'

export default function CreditsBadge() {
  const [loading, setLoading] = React.useState(true)
  const [credits, setCredits] = React.useState<number | null>(null)
  const [err, setErr] = React.useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/profile/credits', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.details || data?.error || 'Falha ao carregar créditos')
      setCredits(data.credits ?? 0)
    } catch (e: any) {
      setErr(e?.message || 'Falha ao carregar créditos')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  if (loading) return <span className="text-xs text-zinc-400">carregando...</span>
  if (err) return <span className="text-xs text-red-400">{err}</span>
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 1l3 7h7l-5.5 4 2 7-6.5-4.5L5 19l2-7L1.5 8H9l3-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Saldo: <strong className="ml-1">{credits}</strong>
    </span>
  )
}
