import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = getRouteClient()

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'missing_file' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const filename = `avatar_${Date.now()}.jpg`
    const path = `${user.id}/${filename}`

    const { error: upErr } = await supabase
      .storage
      .from('avatars')
      .upload(path, bytes, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      })

    if (upErr) {
      return NextResponse.json({ error: 'upload_failed', details: upErr.message }, { status: 400 })
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = pub?.publicUrl

    if (!publicUrl) {
      return NextResponse.json({ error: 'public_url_failed' }, { status: 400 })
    }

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
      .limit(1)

    if (updErr) {
      return NextResponse.json({ error: 'profile_update_failed', details: updErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, avatar_url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message ?? String(e) }, { status: 500 })
  }
}
