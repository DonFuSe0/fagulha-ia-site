import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { event, session } = await req.json().catch(() => ({ }))

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await supabase.auth.setSession(session)
  }
  if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut()
  }

  return NextResponse.json({ ok: true })
}
