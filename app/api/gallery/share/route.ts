// app/api/gallery/share/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

type Body = { name?: string; path?: string }

// Helper to add hours in UTC
function addHours(date: Date, h: number) {
  const d = new Date(date.getTime())
  d.setUTCHours(d.getUTCHours() + h)
  return d
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json().catch(() => ({}))) as Body
    const raw = body.name || body.path
    if (!raw) return NextResponse.json({ error: 'Missing name/path' }, { status: 400 })

    // Paths
    const hasSlash = raw.includes('/')
    const privateObject = hasSlash ? raw : `${user.id}/${raw}`     // gen-private/<user>/<file>
    const fileName = raw.split('/').pop() || 'image.jpg'
    const publicObject = `${fileName}`                              // gen-public/<file>

    // ---- DB GUARD: bloqueia republicação ----
    // Tentamos ler registro na tabela public.generations.
    // Se a coluna/ tabela não existir, ignoramos (backend continua protegendo a regra via Storage).
    try {
      const { data: row, error: selErr } = await supabase
        .from('generations')
        .select('id, public_revoked, is_public')
        .eq('user_id', user.id)
        .eq('file_name', fileName)
        .maybeSingle()
      if (!selErr && row?.public_revoked) {
        return NextResponse.json({ error: 'Esta imagem já foi removida do público e não pode ser republicada.' }, { status: 403 })
      }
      if (!selErr && row?.is_public) {
        // já está público, idempotente
        const { data: pub } = supabase.storage.from('gen-public').getPublicUrl(publicObject)
        return NextResponse.json({ ok: true, public_path: publicObject, public_url: pub.publicUrl })
      }
    } catch (_) {
      // tabela/coluna pode não existir; seguimos sem travar
    }

    // Signed URL privado
    const { data: signed, error: signErr } = await supabase
      .storage.from('gen-private')
      .createSignedUrl(privateObject, 60)
    if (signErr || !signed?.signedUrl) return NextResponse.json({ error: signErr?.message || 'Failed to sign private object' }, { status: 500 })

    // Baixa bytes
    const fileRes = await fetch(signed.signedUrl)
    if (!fileRes.ok) return NextResponse.json({ error: 'Failed to fetch private object' }, { status: 502 })
    const contentType = fileRes.headers.get('Content-Type') || 'application/octet-stream'
    const arrayBuf = await fileRes.arrayBuffer()

    // Sobe no público (upsert)
    const { error: upErr } = await supabase
      .storage.from('gen-public')
      .upload(publicObject, new Uint8Array(arrayBuf), {
        contentType,
        upsert: true,
        cacheControl: '31536000',
      })
    if (upErr) return NextResponse.json({ error: upErr.message || 'Failed to upload to public bucket' }, { status: 500 })

    // Upsert metadados para refletir publicação e expiração de 72h
    try {
      const now = new Date()
      const expires = addHours(now, 72)
      const upsert = {
        user_id: user.id,
        file_name: fileName,
        is_public: true,
        public_since: now.toISOString(),
        public_expires_at: expires.toISOString(),
        public_revoked: false,
        public_path: publicObject,
      }
      await supabase.from('generations').upsert(upsert, { onConflict: 'user_id,file_name' })
    } catch (_) {
      // Ignora se tabela/colunas não existirem
    }

    const { data: pub } = supabase.storage.from('gen-public').getPublicUrl(publicObject)
    return NextResponse.json({ ok: true, public_path: publicObject, public_url: pub.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
