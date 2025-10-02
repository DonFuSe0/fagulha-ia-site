// Correção: usar supabaseRoute() e persistir avatar_url
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

  const filePath = `avatars/${user.id}-${Date.now()}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
    upsert: true
  })
  if (uploadError) return NextResponse.json({ ok: false, error: uploadError.message }, { status: 400 })

  const { data: pub } = await supabase.storage.from('avatars').getPublicUrl(filePath)
  const publicUrl = pub.publicUrl

  const { error: updErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
  if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 400 })

  return NextResponse.json({ ok: true, avatar_url: publicUrl })
}
