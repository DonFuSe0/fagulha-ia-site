import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  const form = await req.formData()
  const nickname = (form.get('nickname') as string || '').trim()
  if (!/^[A-Za-z0-9_]{3,20}$/.test(nickname)) {
    return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
  }
  const { error } = await supabase.from('profiles').update({ nickname }).eq('id', user.id)
  // se erro for unique violation, só volta pro form (UI mostra toast se você quiser)
  return NextResponse.redirect(new URL('/settings?tab=perfil', req.url))
}
