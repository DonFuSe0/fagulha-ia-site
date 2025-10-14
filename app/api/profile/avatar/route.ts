import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseServerClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url || !key) return null
  return createSupabaseServerClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: Request){
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const admin = getAdmin()

  const { data: { user }, error } = await supabase.auth.getUser()
  if(error || !user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const form = await req.formData()
  const picked = (form.get('file') || form.get('avatar')) as File | null
  if(!picked) return NextResponse.json({ error: 'file_missing' }, { status: 400 })

  // Validação de tipo e tamanho
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(picked.type)) {
    return NextResponse.json({ error: 'invalid_type', details: 'Apenas PNG, JPG ou WEBP são aceitos.' }, { status: 400 })
  }
  if (picked.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: 'too_large', details: 'Tamanho máximo: 3MB.' }, { status: 400 })
  }
  const ext = (picked.name?.split('.')?.pop() || 'jpg').toLowerCase()
  const objectPath = `${user.id}/avatar_${Date.now()}.${ext}`
  const bytes = new Uint8Array(await picked.arrayBuffer())
  const contentType = picked.type || (ext === 'png' ? 'image/png' : 'image/jpeg')


  // Upload com tratamento de erro e path real
  let uploadResult = await supabase.storage.from('avatars').upload(objectPath, bytes, { cacheControl:'0', upsert: true, contentType })
  let upErr = uploadResult.error
  let savedPath = uploadResult.data?.path || objectPath
  if(upErr && admin){
    const r2 = await admin.storage.from('avatars').upload(objectPath, bytes, { cacheControl:'0', upsert: true, contentType })
    upErr = r2.error || undefined
    savedPath = r2.data?.path || objectPath
  }
  if(upErr) return NextResponse.json({ error: 'upload_failed', details: upErr.message }, { status: 500 })

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(savedPath)
  const ver = Date.now().toString()
  const publicUrl = `${pub.publicUrl}?v=${ver}`

  // read previous path
  // Salva o path real do arquivo em avatar_url
  const upsertResult = await (admin || supabase).from('profiles').upsert({ id: user.id, avatar_url: savedPath }, { onConflict: 'id' })
  if (upsertResult.error) {
    console.error('Erro ao atualizar profile:', upsertResult.error)
    return NextResponse.json({ error: 'profile_update_failed', details: upsertResult.error.message }, { status: 500 })
  }
  // Salva o path real também no user_metadata
  try { await supabase.auth.updateUser({ data: { avatar_url: savedPath, avatar_ver: ver } }) } catch {}

  // delete others synchronously
  try {
    const client = admin || supabase
    const { data: list } = await client.storage.from('avatars').list(user.id, { limit: 1000 })
    const toDelete = (list || []).map(x => `${user.id}/${x.name}`).filter(p => p !== objectPath)
    if (toDelete.length) await client.storage.from('avatars').remove(toDelete)
  } catch {}

  console.log('Avatar upload - publicUrl:', publicUrl)
  // Retorna tanto a URL pública (para atualização imediata da UI) quanto o path salvo (para o app usar como fonte de verdade)
  return NextResponse.json({ ok: true, avatar_url: publicUrl, avatar_path: savedPath, ver }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  })
}
