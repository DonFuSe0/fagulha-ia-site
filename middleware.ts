// middleware.ts — Supabase cookie sync for SSR + App Router
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // This ensures the auth cookies are kept in sync on every request
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  return res
}

// Run on all routes except Next static assets and images
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}