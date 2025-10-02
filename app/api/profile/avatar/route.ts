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
  const key = `avatars/${user.id}-${Date.now()}.${ext}`

  // Upload
  const { error: upErr } = await supabase.storage.from('avatars').upload(key, file, {
    cacheControl: '3600',
    upsert: true
  })
  if (upErr) {
    return NextResponse.json({ ok: false, error: 'Falha ao enviar avatar: ' + upErr.message }, { status: 400 })
  }

  const pub = await supabase.storage.from('avatars').getPublicUrl(key)
  const publicUrl = pub.data.publicUrl

  const { error: updErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
  if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 400 })

  return NextResponse.json({ ok: true, avatar_url: publicUrl })
}
