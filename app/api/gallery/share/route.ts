// app/api/gallery/share/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient, createServerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

type Body = { name?: string; path?: string }

function addHours(date: Date, h: number) {
  const d = new Date(date.getTime())
  d.setUTCHours(d.getUTCHours() + h)
  return d
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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

    // 3) Sobe no público — tenta com client do usuário; se política bloquear, usa SERVICE_ROLE se existir
    const tryUpload = async (useService: boolean) => {
      const client = useService
        ? createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: () => cookieStore })
        : supabase
      return client.storage.from('gen-public').upload(publicObject, new Uint8Array(arrayBuf), {
        contentType,
        upsert: true,
        cacheControl: '31536000',
      })
    }

    let upErr = null as any
    // tentativa 1: com usuário autenticado
    let { error } = await tryUpload(false)
    if (error) {
      upErr = error
      // tentativa 2: com SERVICE ROLE (se definido)
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const res2 = await tryUpload(true)
        error = res2.error
        upErr = res2.error
      }
    }

    if (error) {
      return NextResponse.json({
        error: upErr?.message || 'Failed to upload to public bucket',
        hint: 'Ou ajuste a policy do bucket gen-public para INSERT por usuários autenticados sem prefixo de userId, ou defina SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.',
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
