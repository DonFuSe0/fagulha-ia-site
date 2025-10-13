// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseServerClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const admin = getAdmin()

  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const form = await req.formData()
    // Aceita tanto 'file' quanto 'avatar' para evitar desencontro com o front
    const picked = (form.get('file') || form.get('avatar')) as File | null
    if (!picked) return NextResponse.json({ error: 'file_missing' }, { status: 400 })

    const ext = (picked.name?.split('.').pop() || 'jpg').toLowerCase()
    const objectPath = `${user.id}/avatar_${Date.now()}.${ext}`
    const bytes = new Uint8Array(await picked.arrayBuffer())
    const contentType = picked.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

    // Upload: tenta com usuário; se falhar por RLS/ACL, tenta como admin
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
    if (upErr) return NextResponse.json({ error: 'upload_failed', details: upErr.message }, { status: 500 })

    // URL pública com cache-busting
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
    const ver = Date.now().toString()
    const publicUrl = `${pub.publicUrl}?v=${ver}`

    // Lê avatar anterior para limpeza
    let previousPath: string | null = null
    try {
      const { data: profile } = await supabase.from('profiles').select('avatar_path').eq('id', user.id).maybeSingle()
      previousPath = profile?.avatar_path ?? null
    } catch {}

    // Atualiza profile (DB)
    await supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: publicUrl,
      avatar_path: objectPath,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    // Atualiza metadata da sessão para refletir no header imediatamente
    try {
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl, avatar_path: objectPath, avatar_ver: ver } })
    } catch {}

    // Limpeza SINCRONA: remove todos os arquivos exceto o atual
    try {
      const client = admin || supabase
      const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 1000 })
      const toDelete = (list || []).map(x => `${user.id}/${x.name}`).filter(p => p !== objectPath)
      if (toDelete.length) await client.storage.from('avatars').remove(toDelete)
    } catch {}

    return NextResponse.json({ ok: true, avatar_url: publicUrl, ver, path: objectPath })
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message ?? String(e) }, { status: 500 })
  }
}
