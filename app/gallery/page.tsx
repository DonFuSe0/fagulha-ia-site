// app/gallery/page.tsx
'use client'

import React from 'react'

export default function PrivateGalleryPage() {
  const [loading, setLoading] = React.useState(true)
  const [items, setItems] = React.useState<{name:string; path:string; url:string|null; created_at:string|null}[]>([])
  const [err, setErr] = React.useState<string|null>(null)

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/gallery/list', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.details || data?.error || 'Falha ao carregar galeria')
      setItems(data.items || [])
    } catch (e:any) {
      setErr(e?.message || 'Falha ao carregar galeria')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sua Galeria</h1>
        <a href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-200">Voltar</a>
      </div>

      {loading && <p className="text-zinc-400">carregando...</p>}
      {err && <p className="text-red-400">{err}</p>}

      {!loading && !err && items.length === 0 && (
        <p className="text-zinc-400">Você ainda não possui imagens privadas.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.path} className="group relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
            {it.url ? (
              <img src={it.url} alt={it.name} className="w-full h-40 object-cover group-hover:opacity-90 transition" />
            ) : (
              <div className="w-full h-40 grid place-items-center text-xs text-zinc-500">sem preview</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
