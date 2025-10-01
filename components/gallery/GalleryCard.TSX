'use client'
import Image from 'next/image'
import { useState } from 'react'
import { IconPublic, IconPrivate, IconDownload, IconReuse } from '@/components/icons'
type Props = { id: string; imageUrl: string; thumbUrl: string | null; isPublic: boolean; createdAt: string }
export default function GalleryCard(p: Props) {
  const [busy, setBusy] = useState(false)
  async function toggle() { setBusy(true); try { await fetch(`/api/generations/toggle-visibility?id=${p.id}`, { method: 'POST' }); location.reload() } finally { setBusy(false) } }
  async function download() { setBusy(true); try { const r = await fetch(`/api/generations/download-url?id=${p.id}`); const j = await r.json(); if (j?.url) location.href = j.url } finally { setBusy(false) } }
  function reuse() { location.href = `/generate?from=${p.id}` }
  return (
    <div className="group relative rounded-xl overflow-hidden bg-black/20 border border-white/10">
      <div className="relative w-full pt-[100%]">
        <Image src={p.thumbUrl || p.imageUrl} alt="" fill className="object-cover" />
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <button onClick={toggle} className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white" aria-label={p.isPublic ? 'Tornar privada' : 'Tornar pública'}>{p.isPublic ? <IconPrivate/> : <IconPublic/>}</button>
        {!p.isPublic && (<button onClick={download} className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white" aria-label="Baixar"><IconDownload/></button>)}
        <button onClick={reuse} className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white" aria-label="Reutilizar"><IconReuse/></button>
      </div>
    </div>
  )
}
