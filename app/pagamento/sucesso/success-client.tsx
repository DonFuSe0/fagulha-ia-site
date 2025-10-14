'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { paymentMessages as m } from '@/lib/i18n/payment'

interface StatusData {
  status: string
  credited: boolean
  tokens?: number
  credited_at?: string
}

export default function SuccessStatusClient({ refParam }: { refParam?: string }) {
  const [data, setData] = useState<StatusData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!refParam) return
    let active = true
    let interval: any

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status?ref=${encodeURIComponent(refParam)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('status_error')
        const json = await res.json()
        if (active) setData(json)
        if (json.credited || attempts > 60) { // ~60 * 2s = 2min
          clearInterval(interval)
        }
      } catch (e: any) {
        if (active) setError(e.message)
      } finally {
        setAttempts(a => a + 1)
      }
    }

    fetchStatus()
    interval = setInterval(fetchStatus, 2000)
    return () => { active = false; clearInterval(interval) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam])

  const state = data?.status || 'pending'
  const credited = data?.credited
  const longWait = !credited && attempts > 30 // ~1 min

  function copyRef(){
    if(!refParam) return
    try { navigator.clipboard.writeText(refParam); setCopied(true); setTimeout(()=>setCopied(false), 2000) } catch {}
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-16 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">
          {credited ? m.success_title : m.processing_title}
        </h1>
        {refParam && (
          <p className="text-sm text-zinc-500 flex items-center gap-2">
            <span>{m.reference_label}: {refParam}</span>
            <button onClick={copyRef} className="text-xs px-2 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600">{copied ? m.copied : m.copy_ref}</button>
          </p>
        )}
      </header>
      {!credited && (
        <div className="space-y-3">
          <p className="text-zinc-300">{m.processing_desc(state)}</p>
          <div className="h-2 w-full bg-zinc-800 rounded overflow-hidden">
            <div className="h-full bg-orange-500 animate-pulse" style={{ width: `${Math.min(100, (attempts/60)*100)}%` }} />
          </div>
          {longWait && <p className="text-xs text-zinc-500">{m.processing_wait_long}</p>}
        </div>
      )}
      {credited && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-emerald-300 font-medium">{m.tokens_added}</p>
          {typeof data?.tokens === 'number' && <p className="text-sm text-emerald-200 mt-1">{m.more_tokens(data.tokens)}</p>}
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{m.error_status}</p>}
      <div className="flex gap-4 pt-4">
        <Link href="/dashboard" className="rounded bg-orange-600 hover:bg-orange-500 px-5 py-2 font-medium">{m.go_dashboard}</Link>
        <Link href="/planos" className="rounded bg-zinc-700 hover:bg-zinc-600 px-5 py-2 font-medium">{m.view_plans}</Link>
      </div>
    </main>
  )
}
