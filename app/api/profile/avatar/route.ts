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
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 })

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const filename = `avatar_${Date.now()}.${ext}`
    const objectPath = `${user.id}/${filename}`

    const bytes = new Uint8Array(await file.arrayBuffer())
    const contentType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg')

    // Upload (user -> fallback service role)
    let upErr = (await supabase.storage.from('avatars').upload(objectPath, bytes, {
      cacheControl: '1',
      upsert: true,
      contentType,
    })).error
    if (upErr && admin) {
      const r2 = await admin.storage.from('avatars').upload(objectPath, bytes, {
        cacheControl: '1',
        upsert: true,
        contentType,
      })
      upErr = r2.error || undefined
    }
    if (upErr) return NextResponse.json({ error: upErr.message || 'Falha no upload' }, { status: 500 })

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
    // cache-busting param garante que Next/Image e navegador não mostrem avatar antigo
    const bust = Date.now().toString()
    const publicUrl = `${pub.publicUrl}?v=${bust}`

    // Lê avatar anterior
    let previousPath: string | null = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_path')
        .eq('id', user.id)
        .maybeSingle()
      previousPath = profile?.avatar_path ?? null
    } catch {}

    // Atualiza perfil (DB)
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: publicUrl,
        avatar_path: objectPath,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    } catch {}

    // Atualiza metadata da sessão (para Navbar que lê session.user.user_metadata)
    try {
      await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          avatar_path: objectPath,
          avatar_ver: bust,
        }
      })
    } catch {}

    // Remove avatar anterior (best-effort)
    ;(async () => {
      const client = admin || supabase
      try {
        const toDelete: string[] = []
        if (previousPath && previousPath !== objectPath) {
          toDelete.push(previousPath)
        } else if (!previousPath) {
          const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 100 })
          const leftovers = (list || []).map(x => `${user.id}/${x.name}`).filter(p => p !== objectPath)
          if (leftovers.length) await client.storage.from('avatars').remove(leftovers)
        }
        if (toDelete.length) await client.storage.from('avatars').remove(toDelete)
      } catch {}
    })()

    return NextResponse.json({ ok: true, path: objectPath, url: publicUrl, ver: bust })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
