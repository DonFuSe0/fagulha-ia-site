'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

type Item = {
  name?: string
  url?: string
  signedUrl?: string
  image_url?: string
  thumb_url?: string
}

type Props = {
  items: Item[]
}

function filenameFrom(pathOrUrl: string) {
  try {
    const u = new URL(pathOrUrl, window.location.origin)
    const last = u.pathname.split('/').filter(Boolean).pop() || 'image.jpg'
    return last.includes('.') ? last : `${last}.jpg`
  } catch {
    const parts = pathOrUrl.split('?')[0].split('/')
    const last = parts.filter(Boolean).pop() || 'image.jpg'
    return last.includes('.') ? last : `${last}.jpg`
  }
}

async function forceDownload(src: string, filenameHint?: string) {
  const filename = filenameHint || filenameFrom(src)
  try {
    const resp = await fetch(src, { credentials: 'include' })
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch {
    // Fallback: try anchor with download directly
    const a = document.createElement('a')
    a.href = src
    a.setAttribute('download', filename)
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
}

export default function GalleryGrid({ items }: Props) {
  const [count, setCount] = useState(16)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const list = useMemo(() => {
    return (items || []).map((it) => {
      const src = it.thumb_url || it.image_url || it.signedUrl || it.url || ''
      const path = it.name || ''
      return { src, path, it }
    }).filter(x => !!x.src)
  }, [items])

  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCount((c) => Math.min(c + 16, list.length))
      })
    }, { rootMargin: '800px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [list.length])

  const visible = list.slice(0, count)

  async function onShare(path: string) {
    if (!path) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'error', message: 'Caminho inválido para compartilhar.' } }))
      return
    }
    try {
      const res = await fetch('/api/gallery/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({}))
        throw new Error(j?.error || 'Falha ao compartilhar')
      }
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'success', message: 'Imagem publicada em Explorar.' } }))
    } catch (e:any) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { kind: 'error', message: e?.message || 'Falha ao compartilhar.' } }))
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map(({ src, path }, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-lg bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Imagem da sua galeria"
              loading="lazy"
              className="w-full h-full object-cover aspect-[320/410] transition-transform duration-300 ease-out group-hover:scale-105"
            />
            {/* Overlay hover */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Action bar (bottom-right) */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Share */}
              <button
                type="button"
                onClick={() => onShare(path)}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/10 hover:bg-white/20 px-2 py-1 text-[11px] text-zinc-100"
                title="Permitir público"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                  <path d="M16 6l-4-4-4 4" />
                  <path d="M12 2v14" />
                </svg>
                Publicar
              </button>
              {/* Download (force) */}
              <button
                type="button"
                onClick={() => forceDownload(src, filenameFrom(path || src))}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/10 hover:bg-white/20 px-2 py-1 text-[11px] text-zinc-100"
                title="Download"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
                Baixar
              </button>
              {/* Reuse */}
              <a
                href={path ? `/generate?path=${encodeURIComponent(path)}` : '/generate'}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/10 hover:bg-white/20 px-2 py-1 text-[11px] text-zinc-100"
                title="Reutilizar na geração"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-9-9" />
                  <path d="M22 2 12 12" />
                </svg>
                Reutilizar
              </a>
            </div>
          </div>
        ))}
      </div>

      {count < list.length && (
        <div ref={sentinelRef} className="h-10" />
      )}
    </>
  )
}
