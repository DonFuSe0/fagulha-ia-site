export const dynamic = 'force-dynamic'
export const revalidate = 0

import GalleryGrid from './GalleryGrid'
import AppHeader from '../_components/AppHeader'
import { headers } from 'next/headers'
import SkeletonLoader from '@/components/SkeletonLoader'

type Item = {
  name?: string
  url?: string
  signedUrl?: string
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
  const cookie = headers().get('cookie') ?? ''

  // URL absoluta + cookies explícitos para produção (evita ERR_INVALID_URL e mantém sessão)
  const res = await fetch(`${base}/api/gallery/list`, {
    cache: 'no-store',
    headers: { cookie },
  })
  let raw: any = null
  try { raw = await res.json() } catch { raw = null }

  const items: Item[] = Array.isArray(raw) ? raw
    : Array.isArray(raw?.items) ? raw.items
    : Array.isArray(raw?.data) ? raw.data
    : []

  const isLoading = !raw
  return (
    <>
      <AppHeader />
      <div className="relative min-h-screen overflow-hidden">
        {/* Gradiente animado de fundo */}
        <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-25 animate-pulse"
            style={{background: 'radial-gradient(ellipse at 60% 40%, #f472b6 0%, #818cf8 60%, transparent 100%)'}} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-2xl opacity-20 animate-spin-slow"
            style={{background: 'radial-gradient(ellipse at 80% 80%, #34d399 0%, #0f172a 70%)'}} />
        </div>
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-zinc-100 animate-text-glow drop-shadow-[0_2px_16px_rgba(244,114,182,0.18)]">Minha Galeria</h1>
            <a href="/dashboard" className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10 shadow shadow-pink-400/10 transition-transform hover:scale-105">Voltar</a>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <SkeletonLoader className="h-60 w-full mb-2" />
              <SkeletonLoader className="h-60 w-full mb-2" />
              <SkeletonLoader className="h-60 w-full mb-2" />
              <SkeletonLoader className="h-60 w-full mb-2" />
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </main>
        {/* Animations CSS */}
        <style jsx global>{`
          @keyframes gradient-move {
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.03); }
            100% { transform: translateY(0) scale(1); }
          }
          .animate-gradient-move > div:first-child {
            animation: gradient-move 8s ease-in-out infinite;
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 24s linear infinite;
          }
          @keyframes text-glow {
            0%, 100% { text-shadow: 0 0 8px #f472b6, 0 0 24px #818cf8; }
            50% { text-shadow: 0 0 24px #818cf8, 0 0 48px #f472b6; }
          }
          .animate-text-glow {
            animation: text-glow 2.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  )
}
