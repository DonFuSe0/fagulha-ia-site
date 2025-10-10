// app/auth/logout/route.ts
import supabaseRoute from '@/lib/supabase/routeClient'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = supabaseRoute()

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL))
}
