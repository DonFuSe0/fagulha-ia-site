export const dynamic = 'force-dynamic'
export const revalidate = 0

type Item = {
  name?: string
  url?: string
  publicUrl?: string
  signedUrl?: string
  href?: string
  image_url?: string
  thumb_url?: string
}

export default async function Page() {
  // Fonte correta: bucket público (gen-public) via API
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
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
