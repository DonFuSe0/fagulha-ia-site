// app/api/generations/params/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

  const { data: g } = await supabase
    .from('generations')
    .select('id, user_id, is_public, params')
    .eq('id', id)
    .maybeSingle()

  if (!g) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Se for privada, só o dono pode ver os params
  if (!g.is_public) {
    if (!user || g.user_id !== user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
  }

  return NextResponse.json({ id: g.id, params: g.params || {} })
}
