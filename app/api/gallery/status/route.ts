// app/api/gallery/status/route.ts
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

    const body = await req.json().catch(() => ({})) as { names?: string[] }
    const names = Array.isArray(body?.names) ? body.names.filter(Boolean) : []
    if (names.length === 0) return NextResponse.json({ ok: true, map: {} })

    // Best-effort: se a tabela não existir, devolve vazio
    const { data, error } = await supabase
      .from('generations')
      .select('file_name, is_public, public_revoked')
      .eq('user_id', user.id)
      .in('file_name', names)

    if (error) return NextResponse.json({ ok: true, map: {} }) // silencioso

    const map: Record<string, { is_public: boolean; public_revoked: boolean }> = {}
    for (const row of data || []) {
      map[row.file_name] = { is_public: !!row.is_public, public_revoked: !!row.public_revoked }
    }
    return NextResponse.json({ ok: true, map })
  } catch (e:any) {
    return NextResponse.json({ ok: true, map: {} })
  }
}
