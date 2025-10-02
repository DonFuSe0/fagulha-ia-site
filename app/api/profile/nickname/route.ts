// Correção: usar supabaseRoute() com policy RLS para update do próprio perfil
import { NextResponse } from 'next/server'
import { supabaseRoute } from '@/lib/supabase/routeClient'

export async function POST(req: Request) {
  const supabase = supabaseRoute()
  const body = await req.json()
  const { nickname } = body

  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes?.user
  if (!user) return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 })

  const { error } = await supabase.from('profiles').update({ nickname }).eq('id', user.id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
