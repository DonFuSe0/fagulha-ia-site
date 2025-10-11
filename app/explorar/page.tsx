// app/explorar/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { IconReuse } from '../_components/icons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

\1
  // Fonte: bucket público (gen-public) via API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/explore/list`, { cache: 'no-store' });
  const items = await res.json().catch(() => []);
  const getUrl = (it:any) => it?.thumb_url || it?.image_url || it?.url || it?.publicUrl || it?.signedUrl || it?.href || '';
  const supabase = createServerComponentClient<any>({ cookies })
  const pageSize = 24
  let query = supabase
    .from('generations')
    .select('id, image_url, thumb_url, is_public, public_since, params, created_at')
    .eq('is_public', true)
    .order('public_since', { ascending: false })
    .limit(pageSize)

  if (searchParams.cursor) {
    const [ts] = decodeURIComponent(searchParams.cursor).split('_')
    query = query.lt('public_since', ts)
  }

  const { data: items } = await query
  const nextCursor = items && items.length === pageSize
    ? encodeURIComponent(`${items[items.length-1].public_since}_${items[items.length-1].id}`)
    : null

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-white mb-4">Explorar</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items?.map((g) => (
          <div key={g.id} className="group relative rounded-xl overflow-hidden bg-black/20 border border-white/10">
            <div className="relative w-full pt-[100%]">
              <Image src={(g as any).thumb_url || (g as any).image_url} alt="" fill className="object-cover" />
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              <Link href={`/generate?from=${g.id}`} className="p-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-white" aria-label="Reutilizar">
                <IconReuse/>
              </Link>
            </div>
          </div>
        )) || <div className="text-neutral-400">Sem imagens públicas ainda.</div>}
      </div>
      {nextCursor && (
        <div className="mt-6">
          <a href={`/explorar?cursor=${nextCursor}`} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15">Carregar mais</a>
        </div>
      )}
    </div>
  )
}
