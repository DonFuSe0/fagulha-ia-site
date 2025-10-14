// app/api/me/avatar/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // try session metadata first
  const ver = (user.user_metadata as any)?.avatar_ver
  let url = (user.user_metadata as any)?.avatar_url

  // fallback to profile row
  if (!url) {
    const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle()
    url = profile?.avatar_url || null
  }

  return NextResponse.json({ url, ver })
}
