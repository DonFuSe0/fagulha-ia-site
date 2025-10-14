// app/api/profile/avatar-url/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const uid = url.searchParams.get('uid')

  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const userId = uid || user?.id || null

  if (!userId) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    })
  }

  // lê o profile pelo id
  const { data: profile } = await supabase.from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .maybeSingle()

  // Prioriza avatar_url do banco (mais atualizado) — pode ser path (ex.: userId/file.jpg) ou URL absoluta
  let finalUrl = profile?.avatar_url as string | undefined
  
  // Só usa user_metadata como fallback se não temos nada no banco
  if (!finalUrl && userId === user?.id) {
    const metaUrl = (user?.user_metadata as any)?.avatar_url as string | undefined
    const ver = (user?.user_metadata as any)?.avatar_ver
    if (metaUrl) {
      const sep = metaUrl.includes('?') ? '&' : '?'
      finalUrl = ver ? `${metaUrl}${sep}v=${encodeURIComponent(String(ver))}` : metaUrl
    }
  }

  // Se veio um path relativo (sem http), converte para URL pública do Storage
  if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (base) {
      finalUrl = `${base}/storage/v1/object/public/avatars/${finalUrl}`
    }
  }

  if (!finalUrl) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    })
  }

  // Redireciona para a URL final, com cabeçalhos que impedem cache do fetch do browser/next
  return NextResponse.redirect(finalUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
    },
  })
}
