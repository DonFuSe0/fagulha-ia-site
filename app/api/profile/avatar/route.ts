// Correção: salvar avatar_url após upload
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const formData = await req.formData()
  const file = formData.get('file') as File

  const user = (await supabase.auth.getUser()).data.user
  if (!user) return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 })

  const filePath = `avatars/${user.id}-${Date.now()}.png`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
  if (uploadError) return NextResponse.json({ ok: false, error: uploadError.message }, { status: 400 })

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)

  return NextResponse.json({ ok: true, avatar_url: publicUrl })
}