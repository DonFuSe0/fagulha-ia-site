import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export async function GET(req: Request) {
  const h = headers()
  const isVercelCron = !!h.get('x-vercel-cron') // header padrão da Vercel
  const fromQuery = new URL(req.url).searchParams.get('secret')
  const ok = isVercelCron || (fromQuery && fromQuery === process.env.CRON_SECRET)
  if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const supabase = createRouteHandlerClient<any>({ cookies })
  const { data: pubs } = await supabase.from('generations').select('id, storage_path, public_since').eq('is_public', true).lt('public_since', new Date(Date.now() - 4*24*3600_000).toISOString()).limit(1000)
  const { data: privs } = await supabase.from('generations').select('id, storage_path, created_at').eq('is_public', false).eq('image_deleted', false).lt('created_at', new Date(Date.now() - 24*3600_000).toISOString()).limit(1000)
  const { data: olds } = await supabase.rpc('get_private_overflow', { p_limit: 200 })
  async function del(path: string) {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } })
  }
  for (const g of pubs || []) { const publicPath = (g as any).storage_path.replace('gen-private', 'gen-public'); await del(publicPath); await supabase.from('generations').delete().eq('id', (g as any).id) }
  for (const g of privs || []) { await del((g as any).storage_path); await supabase.from('generations').update({ image_deleted: true, deleted_at: new Date().toISOString() }).eq('id', (g as any).id) }
  for (const g of olds || []) { await del((g as any).storage_path); await supabase.from('generations').update({ image_deleted: true, deleted_at: new Date().toISOString() }).eq('id', (g as any).id) }
  return NextResponse.json({ ok: true, pubs: pubs?.length||0, privs: privs?.length||0, overflow: (olds as any)?.length||0 })
}
