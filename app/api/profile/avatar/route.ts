import { NextResponse } from 'next/server'
import { supabaseRoute } from '@/lib/supabase/routeClient'

export async function POST(req: Request) {
  const supabase = supabaseRoute()
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ ok: false, error: 'Arquivo não enviado' }, { status: 400 })

  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes?.user
  if (!user) return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 })

  // Derivar extensão quando possível
  const original = (file as any).name ?? 'avatar.png'
  const ext = original.includes('.') ? original.split('.').pop() : 'png'
  const key = `${user.id}/${Date.now()}.${ext}`

  // Upload
  const { error: upErr } = await supabase.storage.from('avatars').upload(key, file, {
    cacheControl: '3600',
    upsert: true
  })
  if (upErr) {
    return NextResponse.json({ ok: false, error: 'Falha ao enviar avatar (storage): ' + upErr.message }, { status: 400 })
  }

  const pub = await supabase.storage.from('avatars').getPublicUrl(key)
  const publicUrl = pub.data.publicUrl

  \1
  // Limpeza de avatares antigos (best-effort): mantém apenas o mais novo
  try {
    const { data: list } = await supabase.storage.from('avatars').list(user.id, {
      limit: 100, sortBy: { column: 'created_at', order: 'desc' }
    })
    if (Array.isArray(list) && list.length > 1) {
      const toRemove = list.filter(obj => obj.name !== filename).map(obj => `${user.id}/${obj.name}`)
      if (toRemove.length) {
        await supabase.storage.from('avatars').remove(toRemove)
      }
    }
  } catch {}

  return NextResponse.json({ ok: true, avatar_url: publicUrl })
}
