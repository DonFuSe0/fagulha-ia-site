import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // helper admin client (opcional) para limpar arquivos com segurança
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const admin = (url && key) ? createSupabaseServerClient(url, key, { auth: { persistSession: false } }) : null

  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file_missing' }, { status: 400 })

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const objectPath = `${user.id}/avatar_${Date.now()}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const contentType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

    // upload (user -> fallback admin)
    let upErr = (await supabase.storage.from('avatars').upload(objectPath, bytes, {
      cacheControl: '0', upsert: true, contentType,
    })).error
    if (upErr && admin) {
      const r2 = await admin.storage.from('avatars').upload(objectPath, bytes, {
        cacheControl: '0', upsert: true, contentType,
      })
      upErr = r2.error || undefined
    }
    if (upErr) return NextResponse.json({ error: 'upload_failed', details: upErr.message }, { status: 500 })

    // public url com bust
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
    const ver = Date.now().toString()
    const publicUrl = `${pub.publicUrl}?v=${ver}`

    // ler previous avatar_path
    let previousPath: string | null = null
    try {
      const { data: profile } = await supabase.from('profiles').select('avatar_path').eq('id', user.id).maybeSingle()
      previousPath = profile?.avatar_path ?? null
    } catch {}

    // atualizar perfil
    await supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: publicUrl,
      avatar_path: objectPath,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    // atualizar metadata da sessão (para header re-renderizar)
    try {
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl, avatar_path: objectPath, avatar_ver: ver } })
    } catch {}

    // LIMPEZA SINCRONA: remove todos os arquivos antigos
    try {
      const client = admin || supabase
      const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 1000 })
      const toDelete = (list || []).map(x => `${user.id}/${x.name}`).filter(p => p != objectPath)
      if (toDelete.length) await client.storage.from('avatars').remove(toDelete)
    } catch {}

    return NextResponse.json({ ok: true, avatar_url: publicUrl, ver })
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message ?? String(e) }, { status: 500 })
  }
}
