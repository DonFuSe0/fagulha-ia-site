// app/components/gallery/GalleryCard.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  id: string
  imageUrl: string
  thumbUrl?: string | null
  isPublic: boolean
  createdAt: string
  publicAt?: string | null
  showDownload?: boolean
  onToggled?: () => void
  showPublicTimer?: boolean // novo: mostra contador também no público
}

function msUntil(dateISO: string) {
  const end = new Date(dateISO).getTime()
  const now = Date.now()
  return Math.max(0, end - now)
}

function fmtDHMS(ms: number) {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export default function GalleryCard({
  id, imageUrl, thumbUrl, isPublic, createdAt, publicAt,
  showDownload = true, onToggled, showPublicTimer = true
}: Props) {
  const src = thumbUrl || imageUrl

  const privateEndISO = useMemo(() => {
    const end = new Date(new Date(createdAt).getTime() + 24*3600*1000)
    return end.toISOString()
  }, [createdAt])

  const publicEndISO = useMemo(() => {
    if (!publicAt) return null
    const end = new Date(new Date(publicAt).getTime() + 4*24*3600*1000)
    return end.toISOString()
  }, [publicAt])

  const [msLeft, setMsLeft] = useState<number>(() => isPublic
    ? (publicEndISO ? msUntil(publicEndISO) : 0)
    : msUntil(privateEndISO)
  )

  useEffect(() => {
    const iv = setInterval(() => {
      setMsLeft(prev => {
        const v = isPublic
          ? (publicEndISO ? msUntil(publicEndISO) : 0)
          : msUntil(privateEndISO)
        return v
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [isPublic, privateEndISO, publicEndISO])

  const canDownload = !isPublic && showDownload && msLeft > 0

  async function togglePublic(next: boolean) {
    const res = await fetch('/api/gallery/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, makePublic: next })
    })
    if (res.ok) onToggled?.()
  }

  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-900/40 border border-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-full h-full object-cover transition group-hover:scale-[1.02]" />

      {/* Ações */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {/* Toggle visibilidade */}
        <button
          title={isPublic ? 'Tornar privado' : 'Tornar público'}
          onClick={() => togglePublic(!isPublic)}
          className="h-8 w-8 rounded-full bg-black/35 hover:bg-black/50 border border-white/15 backdrop-blur flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/90">
            {isPublic ? (
              <path fill="currentColor" d="M2 12s3.5-7 10-7c2.2 0 4 .8 5.5 1.9L20 6l2 2-1.2 1.2C21.5 10.3 22 11.2 22 12c0 0-3.5 7-10 7-2.2 0-4-.8-5.5-1.9L4 18l-2-2 1.2-1.2C2.5 13.7 2 12.8 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            ) : (
              <path fill="currentColor" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            )}
          </svg>
        </button>

        {/* Download somente no privado e com tempo disponível */}
        {canDownload && (
          <a
            href={imageUrl}
            download
            title="Baixar"
            className="h-8 w-8 rounded-full bg-black/35 hover:bg-black/50 border border-white/15 backdrop-blur flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/90">
              <path fill="currentColor" d="M12 3v10l4-4 1.4 1.4L12 16.8 6.6 10.4 8 9l4 4V3h0zM5 19h14v2H5z"/>
            </svg>
          </a>
        )}

        {/* Reutilizar */}
        <a
          href={`/gerar?from=${id}`}
          title="Reutilizar ajustes"
          className="h-8 w-8 rounded-full bg-black/35 hover:bg-black/50 border border-white/15 backdrop-blur flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/90">
            <path fill="currentColor" d="M12 5V1l5 5-5 5V7a5 5 0 1 0 5 5h2a7 7 0 1 1-7-7z"/>
          </svg>
        </a>
      </div>

      {/* Badge do timer:
          - privado: sempre mostra (expira em 24h de created_at)
          - público: agora também mostra (expira em 4d de public_at) se showPublicTimer = true
      */}
      {(!isPublic || showPublicTimer) && (
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 rounded-full bg-black/40 border border-white/15 text-[11px] text-white/90 backdrop-blur">
            {msLeft > 0 ? `expira em ${fmtDHMS(msLeft)}` : 'expirado'}
          </span>
        </div>
      )}
    </div>
  )
}
