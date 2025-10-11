// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  // Always refresh the session on navigation so tokens stay valid and cookies persist.
  const res = NextResponse.next()
  try {
    const supabase = createMiddlewareClient({ req, res })
    await supabase.auth.getSession() // will refresh if needed and set cookies on `res`
  } catch {
    // Keep navigating even if Supabase is momentarily unavailable
  }
  return res
}

// Optionally limit paths; here we refresh for the whole app.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
