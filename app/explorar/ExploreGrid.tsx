'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

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

  const urls = useMemo(() => {
    return (items || []).map((it) => it.thumb_url || it.image_url || it.url || it.publicUrl || it.signedUrl || it.href).filter(Boolean) as string[]
  }, [items])

  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCount((c) => Math.min(c + 16, urls.length))
        }
      })
    }, { rootMargin: '800px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [urls.length])

  if (!urls.length) {
    return <div className="text-sm text-zinc-400">Ainda não há imagens públicas.</div>
  }

  const visible = urls.slice(0, count)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((src, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-lg bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Imagem pública"
              loading="lazy"
              className="w-full h-full object-cover aspect-[320/410] transition-transform duration-300 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ))}
      </div>

      {count < urls.length && (
        <div ref={sentinelRef} className="h-10" />
      )}
    </>
  )
}
