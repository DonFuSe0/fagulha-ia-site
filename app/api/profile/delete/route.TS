import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  const supaUser = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supaUser.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url))

  const form = await req.formData()
  if ((form.get('confirm') as string)?.toUpperCase() !== 'EXCLUIR') {
    return NextResponse.redirect(new URL('/settings?tab=seguranca', req.url))
  }

  // cria registro de proteção 30 dias
  const email = user.email || ''
  const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
  const banUntil = new Date(Date.now() + 30*24*3600_000).toISOString()
  await supaUser.from('account_deletions').insert({ user_id: user.id, email_hash: emailHash, ban_until })

  // opcional: zera créditos e registra movimento
  await supaUser.from('tokens').insert({ user_id: user.id, amount: 0, description: 'Encerramento de conta' })

  // deletar usuário via service role
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await admin.auth.admin.deleteUser(user.id)

  // limpar cookies/sessão
  return NextResponse.redirect(new URL('/auth/login', req.url))
}
