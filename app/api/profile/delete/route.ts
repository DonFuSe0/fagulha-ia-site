// app/api/profile/delete/route.ts
import supabaseRoute from '@/lib/supabase/routeClient'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = supabaseRoute()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }

  const { error } = await supabase.from('profiles').delete().eq('id', user.id)
  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
