// app/api/gallery/unshare/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient, createServerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const raw: string | undefined = body?.name || body?.path
    if (!raw) return NextResponse.json({ error: 'Missing name/path' }, { status: 400 })

    const fileName = raw.split('/').pop() || raw
    const publicObject = `${fileName}` // gen-public/<file>

    const tryRemove = async (useService: boolean) => {
      const client = useService
        ? createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: () => cookieStore })
        : supabase
      return client.storage.from('gen-public').remove([publicObject])
    }

    let delErr = null as any
    let { error } = await tryRemove(false)
    if (error) {
      delErr = error
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const res2 = await tryRemove(true)
        error = res2.error
        delErr = res2.error
      }
    }
    if (error) {
      return NextResponse.json({
        error: delErr?.message || 'Failed to delete from public bucket',
        hint: 'Ajuste a policy do bucket gen-public para DELETE por usuários autenticados, ou use SERVICE ROLE no servidor.',
      }, { status: 500 })
    }

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
    console.error('unshare route fatal:', e?.message, e)
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
