// app/settings/_panels/TokensPanel.tsx
'use client'

import React from 'react'

export default function TokensPanel() {
  const [loading, setLoading] = React.useState(true)
  const [credits, setCredits] = React.useState<number>(0)
  const [err, setErr] = React.useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/profile/credits', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.details || data?.error || 'Falha ao carregar saldo')
      setCredits(data.credits ?? 0)
    } catch (e:any) {
      setErr(e?.message || 'Falha ao carregar saldo')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Seus Tokens</h2>
          <p className="text-sm text-zinc-400">Gerencie seu saldo e aquisições.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2">
          <span className="text-sm text-zinc-400">Saldo atual</span>
          <span className="text-base font-semibold">{loading ? '...' : credits}</span>
        </div>
      </header>

      {err && <p className="text-red-400 text-sm">{err}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/planos" className="rounded-xl p-4 border border-zinc-800 hover:bg-zinc-900">
          <h3 className="font-medium mb-1">Adquirir Tokens</h3>
          <p className="text-sm text-zinc-400">Escolha um plano que faça sentido para você.</p>
        </a>
        <a href="/dashboard#historico" className="rounded-xl p-4 border border-zinc-800 hover:bg-zinc-900">
          <h3 className="font-medium mb-1">Histórico</h3>
          <p className="text-sm text-zinc-400">Depósitos e consumo recentes.</p>
        </a>
        <a href="/generate" className="rounded-xl p-4 border border-zinc-800 hover:bg-zinc-900">
          <h3 className="font-medium mb-1">Usar Tokens</h3>
          <p className="text-sm text-zinc-400">Crie novas imagens agora.</p>
        </a>
      </div>
    </div>
  )
}
