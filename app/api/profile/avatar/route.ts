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

    // expect form-data: file
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 })

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const filename = `avatar_${Date.now()}.${ext}`
    const objectPath = `${user.id}/${filename}`

    // Upload avatar
    let { error: upErr } = await supabase.storage.from('avatars').upload(objectPath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })
    if (upErr && admin) {
      const r2 = await admin.storage.from('avatars').upload(objectPath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      })
      upErr = r2.error || undefined
    }
    if (upErr) return NextResponse.json({ error: upErr.message || 'Falha no upload' }, { status: 500 })

    // Public URL (ou use signed se preferir)
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath)
    const publicUrl = pub.publicUrl

    // Lê avatar anterior armazenado no perfil (se existir)
    let previousPath: string | null = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_path')
        .eq('id', user.id)
        .single()
      previousPath = profile?.avatar_path ?? null
    } catch {}

    // Atualiza perfil com novo path/url
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: publicUrl,
        avatar_path: objectPath,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    } catch {}

    // Remove avatar anterior do bucket (best-effort, não bloqueia resposta)
    ;(async () => {
      const client = admin || supabase
      try {
        const toDelete: string[] = []
        if (previousPath && previousPath !== objectPath) {
          toDelete.push(previousPath)
        } else if (!previousPath) {
          // fallback: apaga todos menos o atual dentro da pasta do usuário
          const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 50 })
          const leftovers = (list || []).map(x => `${user.id}/${x.name}`).filter(p => p !== objectPath)
          toDelete.push(...leftovers)
        }
        if (toDelete.length) {
          await client.storage.from('avatars').remove(toDelete)
        }
      } catch {
        // silencioso
      }
    })()

    return NextResponse.json({ ok: true, path: objectPath, url: publicUrl })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
