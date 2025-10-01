import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const h = headers()
  const token = h.get('x-cron-secret') || h.get('X-CRON-SECRET')
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const supabase = createRouteHandlerClient<any>({ cookies })

  // públicas com > 4 dias
  const { data: pubs } = await supabase
    .from('generations')
    .select('id, storage_path, public_since')
    .eq('is_public', true)
    .lt('public_since', new Date(Date.now() - 4*24*3600_000).toISOString())
    .limit(1000)

  // privadas com > 24h (apaga arquivo, mantém linha sinalizada)
  const { data: privs } = await supabase
    .from('generations')
    .select('id, storage_path, created_at')
    .eq('is_public', false)
    .eq('image_deleted', false)
    .lt('created_at', new Date(Date.now() - 24*3600_000).toISOString())
    .limit(1000)

  // overflow > 200 privadas por user (função SQL 024)
  const { data: olds } = await supabase.rpc('get_private_overflow', { p_limit: 200 })

  async function del(path: string) {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
    })
  }

  for (const g of pubs || []) {
    const publicPath = (g as any).storage_path.replace('gen-private', 'gen-public')
    await del(publicPath)
    await supabase.from('generations').delete().eq('id', (g as any).id)
  }

  for (const g of privs || []) {
    await del((g as any).storage_path)
    await supabase.from('generations').update({
      image_deleted: true, deleted_at: new Date().toISOString()
    }).eq('id', (g as any).id)
  }

  for (const g of olds || []) {
    await del((g as any).storage_path)
    await supabase.from('generations').update({
      image_deleted: true, deleted_at: new Date().toISOString()
    }).eq('id', (g as any).id)
  }

  return NextResponse.json({
    ok: true,
    pubs: pubs?.length || 0,
    privs: privs?.length || 0,
    overflow: (olds as any)?.length || 0
  })
}
