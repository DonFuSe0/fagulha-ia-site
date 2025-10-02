// app/api/profile/nickname/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  const form = await req.formData()
  const nickname = ((form.get('nickname') as string | null) ?? '').trim()
  if (!nickname || nickname.length < 3 || nickname.length > 20 || !/^[A-Za-z0-9_]+$/.test(nickname)) {
    return NextResponse.redirect(new URL('/settings?tab=perfil&toast=nick_fail', req.url))
  }

  // tenta atualizar; se houver unique violation (unique lower(nickname)), redireciona com erro
  const { error } = await supabase.from('profiles').update({ nickname }).eq('id', user.id)
  if (error) {
    const isUnique = (error as any).code === '23505'
    return NextResponse.redirect(new URL(`/settings?tab=perfil&toast=${isUnique ? 'nick_dup' : 'nick_fail'}`, req.url))
  }

  return NextResponse.redirect(new URL('/settings?tab=perfil&toast=perfil_ok', req.url))
}
