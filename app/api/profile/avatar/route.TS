// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  const form = await req.formData()
  const file = form.get('avatar') as File | null
  if (!file) return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
  if (file.size > 2*1024*1024) return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const arrayBuffer = await file.arrayBuffer()
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
    return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path.replace('avatars/', '')}`

  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)

  return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
}
