// Force dynamic to silence SSG warning and allow cookies/session usage
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabaseRoute } from '@/lib/supabase/routeClient'

export async function GET() {
  const supabase = supabaseRoute()
  await supabase.auth.signOut()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return NextResponse.redirect(new URL('/', site))
}
