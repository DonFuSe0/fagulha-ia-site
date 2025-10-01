// app/gallery/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import GalleryCard from '../components/gallery/GalleryCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MyGalleryPage() {
  const supabase = createServerComponentClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: gens } = await supabase
    .from('generations')
    .select('id, image_url, thumb_url, is_public, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(40)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-white mb-4">Minha galeria</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {gens?.map((g:any) => (
          <GalleryCard
            key={g.id}
            id={g.id}
            imageUrl={g.image_url}
            thumbUrl={g.thumb_url}
            isPublic={g.is_public}
            createdAt={g.created_at}
          />
        )) || <div className="text-neutral-400">Nenhuma imagem ainda.</div>}
      </div>
    </div>
  )
}
