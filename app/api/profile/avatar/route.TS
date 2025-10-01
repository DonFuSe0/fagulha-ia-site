// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const ajax = url.searchParams.get('ajax') === '1'

  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    if (ajax) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 })
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  const form = await req.formData()
  const file = form.get('avatar') as File | null
  if (!file || file.size > 2*1024*1024 || !['image/png', 'image/jpeg'].includes(file.type)) {
    if (ajax) return NextResponse.json({ ok: false, error: 'bad_file' }, { status: 400 })
    return NextResponse.redirect(new URL('/settings?tab=perfil&toast=avatar_fail', req.url))
  }

  const arrayBuffer = await file.arrayBuffer()
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `avatars/${user.id}/${user.id}.${ext}`

  const upload = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true'
    },
    body: Buffer.from(arrayBuffer)
  })

  if (!upload.ok) {
    if (ajax) return NextResponse.json({ ok: false, error: 'upload_fail' }, { status: 500 })
    return NextResponse.redirect(new URL('/settings?tab=perfil&toast=avatar_fail', req.url))
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${user.id}/${user.id}.${ext}`
  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)

  if (ajax) return NextResponse.json({ ok: true })
  return NextResponse.redirect(new URL('/settings?tab=perfil&toast=avatar_ok', req.url))
}
