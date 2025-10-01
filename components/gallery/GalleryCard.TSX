'use client'
import Image from 'next/image'
import { IconPublic, IconPrivate, IconDownload, IconReuse } from '@/components/icons'
import { hoursLeftFrom } from '@/lib/utils/time'
import { useState } from 'react'

type Props = {
  id: string
  imageUrl: string
  thumbUrl: string | null
  isPublic: boolean
  createdAt: string
}

export default function GalleryCard(p: Props) {
  const [busy, setBusy] = useState(false)
  const hoursLeft = p.isPublic ? 0 : hoursLeftFrom(p.createdAt, 24)

  async function toggle() {
    setBusy(true)
    try {
      await fetch(`/api/generations/toggle-visibility?id=${p.id}`, { method: 'POST' })
      location.reload()
    } finally { setBusy(false) }
  }

  async function download() {
    setBusy(true)
    try {
      const r = await fetch(`/api/generations/download-url?id=${p.id}`)
      const j = await r.json()
      if (j?.url) location.href = j.url
    } finally { setBusy(false) }
  }

  function reuse() { location.href = `/generate?from=${p.id}` }

  return (
    <div className="group relative rounded-xl overflow-hidden bg-black/20 border border-white/10">
      <div className="relative w-full pt-[100%]">
        <Image src={p.thumbUrl || p.imageUrl} alt="" fill className="object-cover" />
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white"
          title={p.isPublic ? 'Tornar privada' : 'Tornar pública'}
          aria-label={p.isPublic ? 'Tornar privada' : 'Tornar pública'}
          disabled={busy}
        >{p.isPublic ? <IconPrivate/> : <IconPublic/>}</button>

        {!p.isPublic && (
          <button
            onClick={download}
            className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white"
            title={hoursLeft>0 ? `Baixar (expira em ${hoursLeft}h)` : 'Download indisponível'}
            aria-label="Baixar"
            disabled={busy || hoursLeft<=0}
          ><IconDownload/></button>
        )}

        <button
          onClick={reuse}
          className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white"
          title="Reutilizar configurações"
          aria-label="Reutilizar configurações"
          disabled={busy}
        ><IconReuse/></button>
      </div>
    </div>
  )
}
