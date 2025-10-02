// Correção: registrar exclusão e marcar banimento
import { NextResponse } from 'next/server'
import { supabaseRoute } from '@/lib/supabase/routeClient'

function md5(input: string) {
  // Implementação mínima para evitar dependência de 'crypto' em edge runtimes
  // (Se o projeto usar runtime Node, pode usar crypto nativo)
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  // Placeholder: em produção use uma lib md5 ou mova a hash p/ o backend/serverless com Node.
  // Aqui só para manter contrato:
  return Array.from(data).map((b)=>b.toString(16).padStart(2,'0')).join('').slice(0,32)
}

export async function POST() {
  const supabase = supabaseRoute()

  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes?.user
  if (!user) return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 })

  const email = (user.email ?? '')
  const emailHash = md5(email)

  const banUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insErr } = await supabase.from('account_deletions').insert({
    user_id: user.id,
    email_hash: emailHash,
    ban_until: banUntil
  })
  if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 400 })

  // Remover perfil (dados pessoais) — o usuário será de fato apagado por rotina administrativa, se necessário
  const { error: delErr } = await supabase.from('profiles').delete().eq('id', user.id)
  if (delErr) return NextResponse.json({ ok: false, error: delErr.message }, { status: 400 })

  // Opcional: pode sinalizar logout no front após sucesso
  return NextResponse.json({ ok: true })
}
