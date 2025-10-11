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

    let delErr: any = null
    let delOk = false

    const first = await supabase.storage.from('gen-public').remove([publicObject])
    if (!first.error) delOk = true
    else {
      delErr = first.error
      if (admin) {
        const second = await admin.storage.from('gen-public').remove([publicObject])
        if (!second.error) delOk = true
        else delErr = second.error
      }
    }

    if (!delOk) {
      return NextResponse.json({
        error: delErr?.message || 'Failed to delete from public bucket',
      }, { status: 500 })
    }

    // Atualiza DB (persistência do bloqueio)
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
