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

  // 1) Auth
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2) File
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 })

  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
  const filename = `avatar_${Date.now()}.${ext}`
  const objectPath = `${user.id}/${filename}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  const contentType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

  // 3) Upload (user -> fallback admin)
  let upErr = (await supabase.storage.from('avatars').upload(objectPath, bytes, {
    cacheControl: '0', upsert: true, contentType,
  })).error
  if (upErr && admin) {
    const r2 = await admin.storage.from('avatars').upload(objectPath, bytes, {
      cacheControl: '0', upsert: true, contentType,
    })
    upErr = r2.error || undefined
  }
  if (upErr) return NextResponse.json({ error: upErr.message || 'Falha no upload' }, { status: 500 })

  // 4) Public URL com bust
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
  const ver = Date.now().toString()
  const publicUrl = `${pub.publicUrl}?v=${ver}`

  // 5) Lê avatar anterior
  let previousPath: string | null = null
  try {
    const { data: profile } = await supabase.from('profiles').select('avatar_path').eq('id', user.id).maybeSingle()
    previousPath = profile?.avatar_path ?? null
  } catch {}

  // 6) Atualiza profile
  await supabase.from('profiles').upsert({
    id: user.id,
    avatar_url: publicUrl,
    avatar_path: objectPath,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  // 7) Atualiza metadata da sessão (para header re-renderizar com ?v=)
  try {
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl, avatar_path: objectPath, avatar_ver: ver } })
  } catch {}

  // 8) Limpeza SINCRONA: remove todos os outros arquivos
  try {
    const client = admin || supabase
    const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 1000 })
    const toDelete = (list || []).map(x => `${user.id}/${x.name}`).filter(p => p !== objectPath)
    if (toDelete.length) await client.storage.from('avatars').remove(toDelete)
  } catch {}

  return NextResponse.json({ ok: true, url: publicUrl, ver, path: objectPath })
}
