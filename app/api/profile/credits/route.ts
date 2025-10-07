// app/api/profile/credits/route.ts
import { NextResponse } from 'next/server'
import routeClient from '@/lib/supabase/routeClient'

export async function GET() {
  const supabase = routeClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  const { data, error: qErr } = await supabase
    .from('profiles')
    .select('credits, nickname, avatar_url')
    .eq('id', user.id)
    .single()

  if (qErr) {
    return NextResponse.json({ error: 'profiles_query_failed', details: qErr.message }, { status: 400 })
  }

  return NextResponse.json({ credits: data?.credits ?? 0, nickname: data?.nickname ?? null, avatar_url: data?.avatar_url ?? null })
}
