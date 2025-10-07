// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server'
import routeClient from '@/lib/supabase/routeClient'

export async function POST(req: Request) {
  const supabase = routeClient()

  const { data: userData, error: userErr } = await supabase.auth.getUser()
  const user = userData?.user
  if (userErr || !user) {
    return NextResponse.json({ error: 'not_authenticated', details: userErr?.message }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 })
  }

  const original = file.name || 'avatar.png'
  const ext = (original.split('.').pop() || 'png').toLowerCase()
  const filename = `${Date.now()}.${ext}`
  const key = `${user.id}/${filename}`

  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(key, file, { upsert: true, contentType: file.type || 'image/png', cacheControl: '3600' })
  if (upErr) {
    return NextResponse.json({ error: 'upload_failed', details: upErr.message }, { status: 400 })
  }

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(key)
  const publicUrl = pub?.publicUrl ?? null

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)
  if (updErr) {
    return NextResponse.json({ error: 'profile_update_failed', details: updErr.message }, { status: 400 })
  }

  try {
    const { data: list } = await supabase.storage
      .from('avatars')
      .list(user.id, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    if (Array.isArray(list) && list.length > 1) {
      const toRemove = list.filter(obj => obj.name !== filename).map(obj => `${user.id}/${obj.name}`)
      if (toRemove.length) await supabase.storage.from('avatars').remove(toRemove)
    }
  } catch {}

  return NextResponse.json({ ok: true, url: publicUrl }, { status: 200 })
}
