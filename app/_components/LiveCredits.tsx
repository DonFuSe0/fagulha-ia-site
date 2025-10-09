'use client'
import React from 'react'

type CreditsResponse = {
  credits?: number
  nickname?: string
  avatar_url?: string
}

export default function LiveCredits() {
  const [credits, setCredits] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    try {
      const res = await fetch('/api/profile/credits', {
        credentials: 'include',
        headers: { 'cache-control': 'no-cache' }
      })
      const data: CreditsResponse = await res.json()
      if (typeof data?.credits === 'number') setCredits(data.credits)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let alive = true
    const tick = async () => {
      if (!alive) return
      await load()
    }
    tick()
    const id = setInterval(tick, 10000)
    const onVisibility = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      alive = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [load])

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
