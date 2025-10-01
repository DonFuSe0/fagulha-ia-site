import { redirect } from 'next/navigation'
import GalleryCard from '@/components/gallery/GalleryCard'
import { getServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GalleryPage({ searchParams }: { searchParams: { cursor?: string } }) {
  const supabase = getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const pageSize = 24
  let query = supabase.from('generations')
    .select('id, image_url, thumb_url, is_public, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(pageSize)

  if (searchParams.cursor) {
    const [ts] = decodeURIComponent(searchParams.cursor).split('_')
    query = query.lt('created_at', ts)
  }

  const { data: items } = await query
  const nextCursor = items && items.length === pageSize
    ? encodeURIComponent(`${items[items.length-1].created_at}_${items[items.length-1].id}`)
    : null

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-white mb-4">Minha galeria</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items?.map((g) => (
          <GalleryCard
            key={g.id}
            id={g.id as any}
            imageUrl={g.image_url as any}
            thumbUrl={(g as any).thumb_url ?? null}
            isPublic={!!g.is_public}
            createdAt={g.created_at as any}
          />
        )) || <div className="text-neutral-400">Nenhuma imagem ainda.</div>}
      </div>
      {nextCursor && (
        <div className="mt-6">
          <a href={`/gallery?cursor=${nextCursor}`} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15">Carregar mais</a>
        </div>
      )}
    </div>
  )
}
