// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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
    // auth
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // file
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 })

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const filename = `avatar_${Date.now()}.${ext}`
    const objectPath = `${user.id}/${filename}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const contentType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

    // upload
    let upErr = (await supabase.storage.from('avatars').upload(objectPath, bytes, {
      cacheControl: '0',
      upsert: true,
      contentType,
    })).error
    if (upErr && admin) {
      const r2 = await admin.storage.from('avatars').upload(objectPath, bytes, {
        cacheControl: '0',
        upsert: true,
        contentType,
      })
      upErr = r2.error || undefined
    }
    if (upErr) return NextResponse.json({ error: upErr.message || 'Falha no upload' }, { status: 500 })

    // public url + bust
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
    const bust = Date.now().toString()
    const publicUrl = `${pub.publicUrl}?v=${bust}`

    // previous path from profile
    let previousPath: string | null = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_path')
        .eq('id', user.id)
        .maybeSingle()
      previousPath = profile?.avatar_path ?? null
    } catch {}

    // update profile row
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: publicUrl,
        avatar_path: objectPath,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    } catch {}

    // update session user metadata (used by client header/avatar)
    try {
      await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          avatar_path: objectPath,
          avatar_ver: bust,
        },
      })
    } catch {}

    // cleanup: remove all other files in user folder except current object
    ;(async () => {
      const client = admin || supabase
      try {
        const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 1000 })
        const toDelete = (list || [])
          .map(x => `${user.id}/${x.name}`)
          .filter(p => p !== objectPath)
        if (toDelete.length) await client.storage.from('avatars').remove(toDelete)
      } catch {}
    })()

    return NextResponse.json({ ok: true, path: objectPath, url: publicUrl, ver: bust })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
