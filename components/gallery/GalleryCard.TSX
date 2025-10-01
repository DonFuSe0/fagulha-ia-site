// components/gallery/GalleryCard.tsx
'use client'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { IconPublic, IconPrivate, IconDownload, IconReuse } from '@/components/icons'
import { useCountdown } from '@/components/hooks/useCountdown'

type Props = {
  id: string
  imageUrl: string
  thumbUrl: string | null
  isPublic: boolean
  createdAt: string
}

export default function GalleryCard(p: Props) {
  const [busy, setBusy] = useState(false)
  const expiresAtISO = useMemo(() => {
    // 24h após a criação
    const ms = new Date(p.createdAt).getTime() + 24*3600*1000
    return new Date(ms).toISOString()
  }, [p.createdAt])
  const countdown = useCountdown(expiresAtISO)

  async function toggle() {
    setBusy(true)
    try {
      await fetch(`/api/generations/toggle-visibility?id=${p.id}`, { method: 'POST' })
      location.reload()
    } finally {
      setBusy(false)
    }
  }

  async function download() {
    if (countdown.isExpired) return
    setBusy(true)
    try {
      const r = await fetch(`/api/generations/download-url?id=${p.id}`)
      const j = await r.json()
      if (j?.url) location.href = j.url
    } finally {
      setBusy(false)
    }
  }

  function reuse() { location.href = `/generate?from=${p.id}` }

  return (
    <div className="group relative rounded-xl overflow-hidden bg-black/20 border border-white/10">
      <div className="relative w-full pt-[100%]">
        <Image src={p.thumbUrl || p.imageUrl} alt="" fill className="object-cover" />
      </div>

      {/* Badge de expiração (somente privada) */}
      {!p.isPublic && (
        <div className="absolute left-2 top-2 px-2 py-1 rounded-md bg-black/60 border border-white/10 text-[11px] text-white/90">
          {countdown.isExpired ? 'Expirada' : `Expira em ${countdown.toString()()}`}
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white"
          aria-label={p.isPublic ? 'Tornar privada' : 'Tornar pública'}
          title={p.isPublic ? 'Tornar privada' : 'Tornar pública'}
          disabled={busy}
        >
          {p.isPublic ? <IconPrivate/> : <IconPublic/>}
        </button>

        {!p.isPublic && (
          <button
            onClick={download}
            className={`p-2 rounded-lg border ${countdown.isExpired ? 'bg-black/20 border-white/10 text-white/30 cursor-not-allowed' : 'bg-black/40 border-white/10 hover:bg-black/60 text-white'}`}
            aria-label="Baixar (disponível 24h)"
            title={countdown.isExpired ? 'Link expirado (24h)' : 'Baixar (disponível 24h)'}
            disabled={busy || countdown.isExpired}
          >
            <IconDownload/>
          </button>
        )}

        <button
          onClick={reuse}
          className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white"
          aria-label="Reutilizar"
          title="Reutilizar configurações"
          disabled={busy}
        >
          <IconReuse/>
        </button>
      </div>
    </div>
  )
}
