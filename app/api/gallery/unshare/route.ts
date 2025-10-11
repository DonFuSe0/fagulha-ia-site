// app/api/gallery/unshare/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const raw: string | undefined = body?.name || body?.path
    if (!raw) return NextResponse.json({ error: 'Missing name/path' }, { status: 400 })

    const fileName = raw.split('/').pop() || raw
    const publicObject = `${fileName}` // gen-public/<file>

    // Remove do público
    const { error: delErr } = await supabase.storage.from('gen-public').remove([publicObject])
    if (delErr) return NextResponse.json({ error: delErr.message || 'Failed to delete from public bucket' }, { status: 500 })

    // Marca no DB: is_public=false, public_revoked=true, public_revoked_at=now
    try {
      const now = new Date().toISOString()
      await supabase.from('generations').upsert({
        user_id: user.id,
        file_name: fileName,
        is_public: false,
        public_revoked: true,
        public_revoked_at: now,
      }, { onConflict: 'user_id,file_name' })
    } catch (_) {
      // Se tabela/colunas não existirem, ignoramos — a trava continua no backend quando houver
    }

    return NextResponse.json({ ok: true, removed: publicObject })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
