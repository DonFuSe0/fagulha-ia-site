import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: g } = await supabase.from('generations').select('id, user_id, is_public, created_at, storage_path').eq('id', id).eq('user_id', user.id).single()
  if (!g) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (g.is_public) return NextResponse.json({ error: 'public has no download' }, { status: 400 })
  const expiresAt = new Date(new Date(g.created_at as any).getTime() + 24*3600_000)
  if (Date.now() > +expiresAt) return NextResponse.json({ url: null })
  const path = (g as any).storage_path as string
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/sign/${path}?expiresIn=60`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } })
  if (!resp.ok) return NextResponse.json({ error: 'sign failed' }, { status: 500 })
  const json = await resp.json()
  return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${json.signedURL}` })
}
