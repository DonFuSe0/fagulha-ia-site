'use client'
import React from 'react'

export default function CreditsInline() {
  const [credits, setCredits] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/profile/credits', { credentials: 'include' })
        const data = await res.json()
        if (alive && typeof data?.credits === 'number') setCredits(data.credits)
      } catch {
        // silencioso
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  if (credits == null && loading) {
    return (
      <span className="ml-2 text-xs text-white/60 bg-white/5 border border-white/10 rounded px-2 py-0.5">
        Carregando…
      </span>
    )
  }

  return (
    <span className="ml-2 text-xs text-white/80 bg-white/10 border border-white/10 rounded px-2 py-0.5">
      Saldo: <strong>{credits ?? 0}</strong>
    </span>
  )
}
