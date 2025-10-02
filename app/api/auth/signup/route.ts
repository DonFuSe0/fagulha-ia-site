// Correção: créditos de boas-vindas somente após confirmação de e-mail (trigger no DB)
// Esta rota agora apenas realiza o signUp e NÃO cria perfil nem insere tokens.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const body = await req.json()
  const { email, password, nickname } = body

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } } // nickname vai para raw_user_meta_data
  })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  // Não criar perfil nem tokens aqui. Isso será feito pelo trigger no DB
  // quando email_confirmed_at for preenchido.

  return NextResponse.json({ ok: true, needs_email_confirmation: true })
}
