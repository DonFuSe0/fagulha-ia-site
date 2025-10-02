// Correção: registrar exclusão e marcar usuário
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST() {
  const supabase = createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 })

  const emailHash = crypto.createHash('md5').update(user.email ?? '').digest('hex')

  await supabase.from('account_deletions').insert({
    user_id: user.id,
    email_hash: emailHash,
    ban_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  })

  await supabase.from('profiles').delete().eq('id', user.id)
  await supabase.auth.admin.deleteUser(user.id)

  return NextResponse.json({ ok: true })
}