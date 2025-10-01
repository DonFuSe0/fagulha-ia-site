// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient<any>({ cookies })
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/auth/login', req.url))
}
