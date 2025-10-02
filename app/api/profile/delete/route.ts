// app/api/profile/delete/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supaUser = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supaUser.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  const form = await req.formData()
  if ((form.get('confirm') as string)?.toUpperCase() !== 'EXCLUIR') {
    return NextResponse.redirect(new URL('/settings?tab=seguranca', req.url))
  }

  // proteção 30 dias (hash do e-mail)
  const email = user.email || ''
  const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
  const banUntil = new Date(Date.now() + 30 * 24 * 3600_000).toISOString()

  // >>> FIX PRINCIPAL: usar a variável banUntil no campo ban_until <<<
  await supaUser.from('account_deletions').insert({
    user_id: user.id,
    email_hash: emailHash,
    ban_until: banUntil,
  } as any)

  // opcional: auditar encerramento
  await supaUser.from('tokens').insert({
    user_id: user.id,
    amount: 0,
    description: 'Encerramento de conta',
  } as any)

  // deletar usuário via service role
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createClient(url, serviceKey)
  await admin.auth.admin.deleteUser(user.id)

  // signOut e redirect
  await supaUser.auth.signOut()
  return NextResponse.redirect(new URL('/auth/login', req.url))
}
