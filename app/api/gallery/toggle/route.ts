// app/api/gallery/toggle/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 })

  const { id, makePublic } = await req.json().catch(() => ({}))
  if (!id || typeof makePublic !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  if (makePublic) {
    const { error } = await supabase.from('generations')
      .update({ is_public: true, public_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  } else {
    const { error } = await supabase.from('generations')
      .update({ is_public: false, public_at: null })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
