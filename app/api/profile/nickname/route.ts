// Correção: update persistente de nickname
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const body = await req.json()
  const { nickname } = body

  const user = (await supabase.auth.getUser()).data.user
  if (!user) return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 })

  const { error } = await supabase.from('profiles').update({ nickname }).eq('id', user.id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}