'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  return (
    <main className="max-w-xl mx-auto px-6 py-16 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">
          {credited ? 'Pagamento confirmado!' : 'Pagamento em processamento'}
        </h1>
        {refParam && <p className="text-sm text-zinc-500">Referência: {refParam}</p>}
      </header>
      {!credited && (
        <p className="text-zinc-300">Estamos confirmando seu pagamento ({state}). Esta página atualiza a cada 2s.</p>
      )}
      {credited && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-emerald-300 font-medium">Créditos adicionados com sucesso.</p>
          {typeof data?.tokens === 'number' && <p className="text-sm text-emerald-200 mt-1">+{data.tokens} tokens</p>}
        </div>
      )}
      {error && <p className="text-red-400 text-sm">Erro ao consultar status.</p>}
      <div className="flex gap-4 pt-4">
        <Link href="/dashboard" className="rounded bg-orange-600 hover:bg-orange-500 px-5 py-2 font-medium">Ir para Dashboard</Link>
        <Link href="/planos" className="rounded bg-zinc-700 hover:bg-zinc-600 px-5 py-2 font-medium">Ver outros planos</Link>
      </div>
    </main>
  )
}
