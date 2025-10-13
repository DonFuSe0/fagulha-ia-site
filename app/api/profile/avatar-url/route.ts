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

  let finalUrl = profile?.avatar_url as string | undefined
  if (!finalUrl) {
    // fallback em user_metadata do próprio usuário (se for ele)
    const metaUrl = (user?.user_metadata as any)?.avatar_url as string | undefined
    const ver = (user?.user_metadata as any)?.avatar_ver
    if (metaUrl) {
      const sep = metaUrl.includes('?') ? '&' : '?'
      finalUrl = ver ? `${metaUrl}${sep}v=${encodeURIComponent(String(ver))}` : metaUrl
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
