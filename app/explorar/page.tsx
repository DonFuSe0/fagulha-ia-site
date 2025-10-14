export const dynamic = 'force-dynamic'
export const revalidate = 0

import { headers } from 'next/headers'
import ExploreGrid from './ExploreGrid'
import AppHeader from '../_components/AppHeader'

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
  const h = headers()
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = (h.get('x-forwarded-proto') || 'https').split(',')[0]
  const envBase = process.env.NEXT_PUBLIC_BASE_URL
  if (envBase && /^https?:\/\//i.test(envBase)) return envBase.replace(/\/$/, '')
  if (host) return `${proto}://${host}`
  return 'http://localhost:3000'
}

export default async function Page() {
  const base = getBaseUrl()

  // Chamada robusta: tolera diferentes formatos de retorno {items}, {data}, {files} ou array direto
  const res = await fetch(`${base}/api/explore/list`, { cache: 'no-store' })
  let raw: any = null
  try {
    raw = await res.json()
  } catch {
    raw = null
  }

  const items: Item[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.files)
    ? raw.files
    : []

  return (
    <>
      <AppHeader />
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-25"
               style={{background: 'radial-gradient(ellipse at center, #34d399 0%, #0f172a 70%)'}} />
        </div>
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-zinc-100">Explorar</h1>
            <a href="/" className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10">Voltar</a>
          </div>
          <ExploreGrid items={items} />
        </main>
      </div>
    </>
  )
}
