// app/api/profile/update/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isValidNickname(n: string) {
  return /^[A-Za-z0-9_]{3,20}$/.test(n)
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  const form = await req.formData()
  const nickname = (form.get('nickname') as string || '').trim()
  if (!isValidNickname(nickname)) {
    return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
  }

  const { error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', user.id)

  if (error) {
    // conflito de unique index (apelido já existe)
    return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
  }

  return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
}
