// app/api/gallery/share/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type Body = { name?: string; path?: string }

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srv) return null
  return createSupabaseServerClient(url, srv, { auth: { persistSession: false } })
}

function addHours(date: Date, h: number) {
  const d = new Date(date.getTime())
  d.setUTCHours(d.getUTCHours() + h)
  return d
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const admin = getAdminClient()

  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json().catch(() => ({}))) as Body
    const raw = body.name || body.path
    if (!raw) return NextResponse.json({ error: 'Missing name/path' }, { status: 400 })

    const hasSlash = raw.includes('/')
    const privateObject = hasSlash ? raw : `${user.id}/${raw}`
    const fileName = raw.split('/').pop() || 'image.jpg'
    const publicObject = `${fileName}`

    // DB guard
    try {
      const { data: row } = await supabase
        .from('generations')
        .select('public_revoked, is_public')
        .eq('user_id', user.id)
        .eq('file_name', fileName)
        .maybeSingle()
      if (row?.public_revoked) return NextResponse.json({ error: 'Esta imagem já foi removida do público e não pode ser republicada.' }, { status: 403 })
      if (row?.is_public) {
        const { data: pub } = supabase.storage.from('gen-public').getPublicUrl(publicObject)
        return NextResponse.json({ ok: true, public_path: publicObject, public_url: pub.publicUrl, is_public: true, locked: false })
      }
    } catch {}

    // Sign + fetch
    const { data: signed, error: signErr } = await supabase.storage.from('gen-private').createSignedUrl(privateObject, 60)
    if (signErr || !signed?.signedUrl) return NextResponse.json({ error: signErr?.message || 'Failed to sign private object' }, { status: 500 })
    const fileRes = await fetch(signed.signedUrl)
    if (!fileRes.ok) return NextResponse.json({ error: 'Failed to fetch private object' }, { status: 502 })
    const contentType = fileRes.headers.get('Content-Type') || 'application/octet-stream'
    const arrayBuf = await fileRes.arrayBuffer()

    // Upload public
    let upErr: any = null
    let upOk = false
    const first = await supabase.storage.from('gen-public').upload(publicObject, new Uint8Array(arrayBuf), { contentType, upsert: true, cacheControl: '31536000' })
    if (!first.error) upOk = true
    else {
      upErr = first.error
      if (admin) {
        const second = await admin.storage.from('gen-public').upload(publicObject, new Uint8Array(arrayBuf), { contentType, upsert: true, cacheControl: '31536000' })
        if (!second.error) upOk = true
        else upErr = second.error
      }
    }
    if (!upOk) return NextResponse.json({ error: upErr?.message || 'Failed to upload to public bucket' }, { status: 500 })

    // DB upsert
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
    return NextResponse.json({ ok: true, public_path: publicObject, public_url: pub.publicUrl, is_public: true, locked: false })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
