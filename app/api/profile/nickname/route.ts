import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'

export async function POST(req: Request) {
  try {
    const { nickname } = await req.json()
    if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 2) {
      return NextResponse.json({ error: 'Nickname inválido' }, { status: 400 })
    }

    const supabase = getRouteClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', user.id)
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro inesperado' }, { status: 500 })
  }
}
