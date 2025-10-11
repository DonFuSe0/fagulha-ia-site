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

export default function GalleryGrid({ items }: Props) {
  const [count, setCount] = useState(16)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [published, setPublished] = useState<Record<string, boolean>>({})
  const [locked, setLocked] = useState<Record<string, boolean>>({})
  const [lightbox, setLightbox] = useState<string | null>(null)

  const list = useMemo(() => {
    return (items || []).map((it) => {
      const src = it.thumb_url || it.image_url || it.signedUrl || it.url || ''
      const name = it.name || ''
      const full = it.image_url || it.signedUrl || it.url || src
      return { src, name, full, it }
    }).filter(x => !!x.src)
  }, [items])

  async function hydrate(names: string[]) {
    if (!names.length) return
    const res = await fetch('/api/gallery/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names }),
    })
    const j = await res.json().catch(()=>({}))
    const map = j?.map || {}
    setPublished((prev) => {
      const next = { ...prev }
      for (const n of names) {
        const alt = (n.split('/').pop() || n)
        const row = map[n] || map[alt]
        if (row && typeof row.is_public === 'boolean') {
          next[n] = row.is_public
        }
      }
      return next
    })
    setLocked((prev) => {
      const next = { ...prev }
      for (const n of names) {
        const alt = (n.split('/').pop() || n)
        const row = map[n] || map[alt]
        // 👇 regra: uma vez bloqueado, permanece bloqueado (nunca limpa por hidratação)
        const wasLocked = !!prev[n]
        const nowLocked = !!row?.public_revoked
        next[n] = wasLocked || nowLocked
      }
      return next
    })
  }

  useEffect(() => {
    const names = list.map(x => x.name).filter(Boolean)
    hydrate(names)
  }, [list])

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = list.slice(0, count)

  function notify(kind: 'success'|'error', message: string) {
    try { window.dispatchEvent(new CustomEvent('notify', { detail: { kind, message } })) } catch {}
  }

  async function onToggleShare(name: string) {
    if (!name) { notify('error', 'Caminho inválido.'); return }
    const isPub = !!published[name]
    const isLocked = !!locked[name]
    if (!isPub && isLocked) {
      notify('error', 'Esta imagem foi removida do público e não pode ser republicada.')
      return
    }
    try {
      if (isPub) {
        // Optimistic: remove efeito verde e trava PARA SEMPRE
        setPublished((p) => ({ ...p, [name]: false }))
        setLocked((l) => ({ ...l, [name]: true }))
      }
      const res = await fetch(isPub ? '/api/gallery/unshare' : '/api/gallery/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const j = await res.json().catch(()=>({}))
      if (!res.ok) {
        // Reverte apenas published; o bloqueio permanece se backend acusou 403
        if (isPub) {
          setPublished((p) => ({ ...p, [name]: true }))
          // mantém locked=true para não permitir spam até rehidratar
        }
        if (res.status === 403) setLocked((prev) => ({ ...prev, [name]: true }))
        throw new Error(j?.error || 'Falha na operação.')
      }
      // Consome flags do backend (se vierem)
      if (typeof j?.is_public === 'boolean') {
        setPublished((p)=>({ ...p, [name]: j.is_public }))
      }
      if (typeof j?.locked === 'boolean' && j.locked) {
        // Uma vez bloqueado, nunca limpa via resposta
        setLocked((l)=>({ ...l, [name]: true }))
      }
      // Re-hidrata — não limpa o bloqueio (regra acima)
      await hydrate([name])
      notify('success', isPub ? 'Imagem removida de Explorar. (republicar desativado)' : 'Imagem publicada em Explorar.')
    } catch (e:any) {
      notify('error', e?.message || 'Falha na operação.')
    }
  }

  function onDownload(name: string) {
    if (!name) return
    const a = document.createElement('a')
    a.href = `/api/gallery/download?name=${encodeURIComponent(name)}`
    a.rel = 'noopener'
    a.click()
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map(({ src, name, full }, idx) => {
          const isPub = !!published[name]
          const isLocked = !!locked[name]
          return (
            <div
              key={idx}
              className={
                "group relative overflow-hidden rounded-lg bg-black/20 transition " +
                (isPub ? "ring-2 ring-emerald-400/60" : "")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Imagem da sua galeria"
                loading="lazy"
                onClick={() => setLightbox(full)}
                className="w-full h-full object-cover aspect-[320/410] transition-transform duration-300 ease-out group-hover:scale-105 cursor-zoom-in"
              />
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 to-transparent" />

              <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggleShare(name) }}
                  disabled={(!isPub && isLocked)}
                  className={
                    "inline-flex items-center rounded-md border px-2 py-1 text-[11px] " +
                    (isLocked
                      ? "cursor-not-allowed opacity-60 border-white/10 bg-white/10 text-zinc-400"
                      : isPub
                        ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                        : "border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20")
                  }
                  title={isLocked ? "Republicação desativada" : (isPub ? "Remover do público" : "Permitir público")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                    <path d="M16 6l-4-4-4 4" />
                    <path d="M12 2v14" />
                  </svg>
                  {isPub ? "Remover" : (isLocked ? "Bloqueado" : "Publicar")}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDownload(name) }}
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
                <a
                  href={name ? `/generate?path=${encodeURIComponent(name)}` : '/generate'}
                  onClick={(e) => e.stopPropagation()}
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
          )
        })}
      </div>

      {count < list.length && (
        <div ref={sentinelRef} className="h-10" />
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
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
            onClick={() => setLightbox(null)}
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
