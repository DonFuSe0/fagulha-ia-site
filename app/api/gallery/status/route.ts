// app/api/gallery/status/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { names?: string[] }
    const names = Array.isArray(body?.names) ? body.names.filter(Boolean) : []
    if (names.length === 0) return NextResponse.json({ ok: true, map: {} })

    const map: Record<string, { is_public: boolean; public_revoked: boolean }> = {}

    // 1) Tenta ler flags do DB (best-effort)
    try {
      const { data } = await supabase
        .from('generations')
        .select('file_name, is_public, public_revoked')
        .eq('user_id', user.id)
        .in('file_name', names)
      for (const row of data || []) {
        map[row.file_name] = { is_public: !!row.is_public, public_revoked: !!row.public_revoked }
      }
    } catch {}

    // 2) Confirma presença no Storage público (fonte da verdade para "is_public")
    //    Para cada file_name, verifica se existe pelo list(search).
    for (const n of names) {
      const fileName = (n.split('/').pop() || n)
      // se já tem no map como true/false, vamos sobrepor com storage se necessário
      const { data: list, error } = await supabase.storage.from('gen-public').list('', { search: fileName, limit: 1 })
      if (!error && Array.isArray(list)) {
        const exists = list.some(obj => obj.name === fileName)
        // Se já existe info no map, preserva public_revoked do banco
        if (!map[fileName]) {
          // Se não existe no banco, mas já foi removido do público, bloqueia permanentemente
          map[fileName] = { is_public: exists, public_revoked: !exists }
        } else {
          map[fileName].is_public = exists
        }
      }
    }

    return NextResponse.json({ ok: true, map })
  } catch (e:any) {
    return NextResponse.json({ ok: true, map: {} })
  }
}
