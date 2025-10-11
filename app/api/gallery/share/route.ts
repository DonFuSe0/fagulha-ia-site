// app/api/gallery/share/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

type Body = {
  name?: string
  path?: string
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as Body
    const raw = body.name || body.path
    if (!raw) {
      return NextResponse.json({ error: 'Missing name/path' }, { status: 400 })
    }

    // Caminhos
    const hasSlash = raw.includes('/')
    const privateObject = hasSlash ? raw : `${user.id}/${raw}`       // gen-private/<user>/<file>
    const fileName = raw.split('/').pop() || 'image.jpg'
    const publicObject = `${fileName}`                                // gen-public/<file> (SEM userId)

    // Signed URL do privado
    const { data: signed, error: signErr } = await supabase
      .storage.from('gen-private')
      .createSignedUrl(privateObject, 60)
    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: signErr?.message || 'Failed to sign private object' }, { status: 500 })
    }

    // Baixa bytes
    const fileRes = await fetch(signed.signedUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch private object' }, { status: 502 })
    }
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
    if (upErr) {
      return NextResponse.json({ error: upErr.message || 'Failed to upload to public bucket' }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from('gen-public').getPublicUrl(publicObject)

    return NextResponse.json({ ok: true, public_path: publicObject, public_url: pub.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
