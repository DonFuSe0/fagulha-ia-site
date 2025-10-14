import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getRouteClient()

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'not_authenticated', details: authErr?.message }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('credits, nickname, avatar_url')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'profile_read_failed', details: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      credits: data?.credits ?? 0, 
      nickname: data?.nickname ?? null, 
      avatar_url: data?.avatar_url ?? null 
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message ?? String(e) }, { status: 500 })
  }
}
