// app/api/gallery/share/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type Body = { name?: string; path?: string }

function addHours(date: Date, h: number) {
  const d = new Date(date.getTime())
  d.setUTCHours(d.getUTCHours() + h)
  return d
}

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
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as Body
    const raw = body.name || body.path
    if (!raw) return NextResponse.json({ error: 'Missing name/path' }, { status: 400 })

    const hasSlash = raw.includes('/')
    const privateObject = hasSlash ? raw : `${user.id}/${raw}`   // gen-private/<user>/<file>
    const fileName = raw.split('/').pop() || 'image.jpg'
    const publicObject = `${fileName}`                            // gen-public/<file>

    // DB guard (best-effort): bloqueia republicação se public_revoked = true
    try {
      const { data: row, error: selErr } = await supabase
        .from('generations')
        .select('public_revoked, is_public')
        .eq('user_id', user.id)
        .eq('file_name', fileName)
        .maybeSingle()
      if (!selErr && row?.public_revoked) {
        return NextResponse.json({ error: 'Esta imagem já foi removida do público e não pode ser republicada.' }, { status: 403 })
      }
      if (!selErr && row?.is_public) {
        const { data: pub } = supabase.storage.from('gen-public').getPublicUrl(publicObject)
        return NextResponse.json({ ok: true, public_path: publicObject, public_url: pub.publicUrl })
      }
    } catch {}

    // 1) Signed URL do privado
    const { data: signed, error: signErr } = await supabase
      .storage.from('gen-private')
      .createSignedUrl(privateObject, 60)
    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: signErr?.message || 'Failed to sign private object', hint: 'Verifique o path no bucket gen-private.' }, { status: 500 })
    }

    // 2) Baixa bytes
    const fileRes = await fetch(signed.signedUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch private object', status: fileRes.status }, { status: 502 })
    }
    const contentType = fileRes.headers.get('Content-Type') || 'application/octet-stream'
    const arrayBuf = await fileRes.arrayBuffer()

    // 3) Sobe no público — tenta com o client do usuário; se falhar, tenta com SERVICE ROLE (se definido)
    let upErr: any = null
    let upOk = false

    const first = await supabase.storage.from('gen-public').upload(publicObject, new Uint8Array(arrayBuf), {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    })
    if (!first.error) {
      upOk = true
    } else {
      upErr = first.error
      if (admin) {
        const second = await admin.storage.from('gen-public').upload(publicObject, new Uint8Array(arrayBuf), {
          contentType,
          upsert: true,
          cacheControl: '31536000',
        })
        if (!second.error) upOk = true
        else upErr = second.error
      }
    }

    if (!upOk) {
      return NextResponse.json({
        error: upErr?.message || 'Failed to upload to public bucket',
        hint: 'Abra INSERT no bucket gen-public para usuários autenticados OU configure SUPABASE_SERVICE_ROLE_KEY.',
      }, { status: 500 })
    }

    // 4) Upsert metadados (best-effort)
    try {
      const now = new Date()
      const expires = addHours(now, 72)
      await supabase.from('generations').upsert({
        user_id: user.id,
        file_name: fileName,
        is_public: true,
        public_since: now.toISOString(),
        public_expires_at: expires.toISOString(),
        public_revoked: false,
        public_path: publicObject,
      }, { onConflict: 'user_id,file_name' })
    } catch {}

    const { data: pub } = supabase.storage.from('gen-public').getPublicUrl(publicObject)
    return NextResponse.json({ ok: true, public_path: publicObject, public_url: pub.publicUrl })
  } catch (e: any) {
    console.error('share route fatal:', e?.message, e)
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
