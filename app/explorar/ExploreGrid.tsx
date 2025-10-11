'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

type Item = {
  name?: string
  url?: string
  publicUrl?: string
  signedUrl?: string
  href?: string
  image_url?: string
  thumb_url?: string
}

type Props = {
  items: Item[]
}

export default function ExploreGrid({ items }: Props) {
  const [count, setCount] = useState(16)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const urls = useMemo(() => {
    return (items || []).map((it) => {
      const thumb = it.thumb_url || it.image_url || it.url || it.publicUrl || it.signedUrl || it.href || ''
      const full = it.image_url || it.url || it.publicUrl || it.signedUrl || it.href || thumb
      return { thumb, full }
    }).filter(x => !!x.thumb)
  }, [items])

  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCount((c) => Math.min(c + 16, urls.length))
      })
    }, { rootMargin: '800px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [urls.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = urls.slice(0, count)

  const openLightbox = useCallback((url: string) => setLightbox(url), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map(({ thumb, full }, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-lg bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt="Imagem pública"
              loading="lazy"
              onClick={() => openLightbox(full)}
              className="w-full h-full object-cover aspect-[320/410] transition-transform duration-300 ease-out group-hover:scale-105 cursor-zoom-in"
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ))}
      </div>

      {count < urls.length && (
        <div ref={sentinelRef} className="h-10" />
      )}

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Visualização"
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 text-zinc-100 border border-white/20"
            aria-label="Fechar"
            title="Fechar"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
