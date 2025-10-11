export const dynamic = 'force-dynamic'
export const revalidate = 0

import GalleryGrid from './GalleryGrid'

type Item = {
  name?: string
  url?: string
  signedUrl?: string
  image_url?: string
  thumb_url?: string
}

export default async function Page() {
  // IMPORTANTE: usar URL relativa para que os cookies de sessão sejam encaminhados automaticamente
  const res = await fetch('/api/gallery/list', { cache: 'no-store' })
  let raw: any = null
  try { raw = await res.json() } catch { raw = null }

  const items: Item[] = Array.isArray(raw) ? raw
    : Array.isArray(raw?.items) ? raw.items
    : Array.isArray(raw?.data) ? raw.data
    : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">Minha Galeria</h1>
        <a href="/dashboard" className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10">Voltar</a>
      </header>

      <GalleryGrid items={items} />
    </div>
  )
}
