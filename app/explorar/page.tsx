export const dynamic = 'force-dynamic'
export const revalidate = 0

import { headers } from 'next/headers'
import ExploreGrid from './ExploreGrid'
import AppHeader from '../_components/AppHeader'
import SkeletonLoader from '@/components/SkeletonLoader'
import ExplorarAnimations from './ExplorarAnimations'

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

  const isLoading = !raw
  return (
    <>
      <AppHeader />
      <div className="relative min-h-screen overflow-hidden">
        {/* Gradiente animado de fundo */}
        <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-25 animate-pulse"
            style={{background: 'radial-gradient(ellipse at 60% 40%, #34d399 0%, #818cf8 60%, transparent 100%)'}} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-2xl opacity-20 animate-spin-slow"
            style={{background: 'radial-gradient(ellipse at 80% 80%, #ff7a18 0%, #0f172a 70%)'}} />
        </div>
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-zinc-100 drop-shadow-[0_2px_16px_rgba(52,211,153,0.18)]">Explorar</h1>
            <a href="/" className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10 shadow shadow-emerald-400/10 transition-transform hover:scale-105">Voltar</a>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <SkeletonLoader className="h-60 w-full mb-2" />
              <SkeletonLoader className="h-60 w-full mb-2" />
              <SkeletonLoader className="h-60 w-full mb-2" />
              <SkeletonLoader className="h-60 w-full mb-2" />
            </div>
          ) : (
            <ExploreGrid items={items} />
          )}
        </main>
        
        {/* Animations CSS */}
        <ExplorarAnimations />
      </div>
    </>
  )
}
