import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import sharp from 'sharp'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: g, error } = await supabase.from('generations').select('id, user_id, image_url, is_public, public_since, storage_path, thumb_url').eq('id', id).eq('user_id', user.id).single()
  if (error || !g) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const toPublic = !g.is_public
  const privatePath = (g as any).storage_path as string | null
  if (!privatePath) return NextResponse.json({ error: 'missing storage path' }, { status: 400 })
  if (toPublic) {
    const fileResp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${privatePath}`, { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } })
    if (!fileResp.ok) return NextResponse.json({ error: 'fetch private file failed' }, { status: 500 })
    const buf = Buffer.from(await fileResp.arrayBuffer())
    const preview = await sharp(buf).resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer()
    const publicPath = privatePath.replace('gen-private', 'gen-public')
    const up = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${publicPath}`, { method: 'PUT', headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' }, body: preview })
    if (!up.ok) return NextResponse.json({ error: 'upload preview failed' }, { status: 500 })
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${publicPath.replace('gen-public/', '')}`
    await supabase.from('generations').update({ is_public: true, public_since: new Date().toISOString(), image_url: publicUrl }).eq('id', id).eq('user_id', user.id)
  } else {
    const publicPath = privatePath.replace('gen-private', 'gen-public')
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${publicPath}`, { method: 'DELETE', headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } })
    await supabase.from('generations').update({ is_public: false, public_since: null }).eq('id', id).eq('user_id', user.id)
  }
  return NextResponse.json({ ok: true })
}
