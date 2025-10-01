import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const body = await req.json()
  const email: string = (body.email || '').toLowerCase().trim()
  const password: string = body.password || ''
  const banned = await supabase.rpc('is_email_banned', { p_email: email })
  if (banned.data === true) {
    return NextResponse.json({ error: 'Este e-mail está temporariamente bloqueado por 30 dias.' }, { status: 429 })
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` }
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
