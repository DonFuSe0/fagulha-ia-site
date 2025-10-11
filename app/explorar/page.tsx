export const dynamic = 'force-dynamic'
export const revalidate = 0

import { headers } from 'next/headers'

type Item = {
  name?: string
  url?: string
  publicUrl?: string
  signedUrl?: string
  href?: string
  image_url?: string
  thumb_url?: string
}

function getBaseUrl() {
  // Prefer env for local dev; fallback to request host for server components in Vercel
  const h = headers()
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = (h.get('x-forwarded-proto') || 'https').split(',')[0]
  const envBase = process.env.NEXT_PUBLIC_BASE_URL
  if (envBase && /^https?:\/\//i.test(envBase)) return envBase.replace(/\/$/, '')
  if (host) return `${proto}://${host}`
  // Last resort for build-time (shouldn't happen at runtime for this page)
  return 'http://localhost:3000'
}

export default async function Page() {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/explore/list`, { cache: 'no-store' })
  const items: Item[] = await res.json().catch(() => [])

  const getUrl = (it: Item) =>
    it.thumb_url || it.image_url || it.url || it.publicUrl || it.signedUrl || it.href || ''

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">Explorar</h1>
      </header>

      {(!items || items.length === 0) ? (
        <div className="text-sm text-zinc-400">Ainda não há imagens públicas.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((it, idx) => {
            const src = getUrl(it)
            if (!src) return null
            return (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-white/10 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={it.name || 'Imagem'} className="w-full h-full object-cover aspect-square" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-[10px] text-zinc-300 truncate">{it.name || 'Imagem'}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
