import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = getRouteClient()

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'not_authenticated', details: authErr?.message }, { status: 401 })
    }

    const body = await req.json().catch(() => null) as { nickname?: string } | null
    const nickname = body?.nickname?.trim()
    if (!nickname) {
      return NextResponse.json({ error: 'invalid_payload', details: 'nickname is required' }, { status: 400 })
    }
    if (nickname.length > 40) {
      return NextResponse.json({ error: 'invalid_nickname', details: 'max 40 chars' }, { status: 400 })
    }

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id)
      .limit(1)

    if (updErr) {
      return NextResponse.json({ error: 'profile_update_failed', details: updErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, nickname })
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message ?? String(e) }, { status: 500 })
  }
}
