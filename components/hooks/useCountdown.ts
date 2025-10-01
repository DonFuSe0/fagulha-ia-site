// components/hooks/useCountdown.ts
'use client'
import { useEffect, useMemo, useState } from 'react'

export function useCountdown(targetAtISO: string) {
  const target = useMemo(() => new Date(targetAtISO).getTime(), [targetAtISO])
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, target - now)

  const seconds = Math.floor(diff / 1000) % 60
  const minutes = Math.floor(diff / (60 * 1000)) % 60
  const hours   = Math.floor(diff / (3600 * 1000))

  const isExpired = diff <= 0

  function toString() {
    if (isExpired) return 'expirada'
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }

  return { ms: diff, hours, minutes, seconds, isExpired, toString }
}
