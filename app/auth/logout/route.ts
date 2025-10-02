import { NextResponse } from 'next/server'
import { supabaseRoute } from '@/lib/supabase/routeClient'

export async function GET() {
  const supabase = supabaseRoute()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
