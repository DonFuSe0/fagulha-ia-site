// app/api/gallery/unshare/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srv) return null
  return createSupabaseServerClient(url, srv, { auth: { persistSession: false } })
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const admin = getAdminClient()

  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const raw: string | undefined = body?.name || body?.path
    if (!raw) return NextResponse.json({ error: 'Missing name/path' }, { status: 400 })

    const fileName = raw.split('/').pop() || raw
    const publicObject = `${fileName}` // gen-public/<file>

    // 1) Remove
    let delErr: any = null
    let { error } = await supabase.storage.from('gen-public').remove([publicObject])
    if (error && admin) {
      const r2 = await admin.storage.from('gen-public').remove([publicObject])
      error = r2.error
      delErr = r2.error
    }
    if (error) {
      return NextResponse.json({ error: delErr?.message || error.message || 'Failed to delete from public bucket' }, { status: 500 })
    }

    // 2) Verifica se realmente sumiu
    const { data: listAfter } = await supabase.storage.from('gen-public').list('', { search: fileName, limit: 1 })
    const stillThere = Array.isArray(listAfter) && listAfter.some(o => o.name === fileName)
    if (stillThere) {
      return NextResponse.json({ error: 'Delete verification failed: object still listed' }, { status: 500 })
    }

    // 3) Atualiza DB para bloquear republicação
    try {
      const now = new Date().toISOString()
      await supabase.from('generations').upsert({
        user_id: user.id,
        file_name: fileName,
        is_public: false,
        public_revoked: true,
        public_revoked_at: now,
      }, { onConflict: 'user_id,file_name' })
    } catch {}

    return NextResponse.json({ ok: true, removed: publicObject })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
