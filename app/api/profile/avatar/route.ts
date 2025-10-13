// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server'
import getRouteClient from '@/lib/supabase/routeClient'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseServerClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: Request) {
  try {
    const supabase = getRouteClient()
    const admin = getAdmin()

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file_missing' }, { status: 400 })

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const objectPath = `${user.id}/avatar_${Date.now()}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const contentType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

    // Upload (user -> fallback admin)
    let upErr = (await supabase.storage.from('avatars').upload(objectPath, bytes, {
      contentType, cacheControl: '0', upsert: true
    })).error
    if (upErr && admin) {
      const r2 = await admin.storage.from('avatars').upload(objectPath, bytes, {
        contentType, cacheControl: '0', upsert: true
      })
      upErr = r2.error || undefined
    }
    if (upErr) return NextResponse.json({ error: 'upload_failed', details: upErr.message }, { status: 500 })

    // Build public URL with version
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
    const ver = Date.now().toString()
    const publicUrl = `${pub.publicUrl}?v=${ver}`

    // Read previous path
    let previousPath: string | null = null
    try {
      const { data: profile } = await supabase.from('profiles').select('avatar_path').eq('id', user.id).maybeSingle()
      previousPath = profile?.avatar_path ?? null
    } catch {}

    // Update profiles row
    await supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: publicUrl,
      avatar_path: objectPath,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

    // Update auth metadata for instant UI refresh
    try {
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl, avatar_path: objectPath, avatar_ver: ver } })
    } catch {}

    // CLEANUP SYNC: remove all other files for this user
    try {
      const client = admin || supabase
      const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 1000 })
      const toDelete = (list || []).map(x => `${user.id}/${x.name}`).filter(p => p !== objectPath)
      if (toDelete.length) await client.storage.from('avatars').remove(toDelete)
    } catch {}

    return NextResponse.json({ ok: true, avatar_url: publicUrl, ver })
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message ?? String(e) }, { status: 500 })
  }
}
