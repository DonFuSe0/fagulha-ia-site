import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from './server';

// Example middleware that attaches the Supabase session to requests.
// You can expand this to enforce authentication or rate limiting.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = supabaseServer();
  // you can inspect sessions here if needed
  const {
    data: { session }
  } = await supabase.auth.getSession();
  // e.g. protect /dashboard if not logged in
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    const redirectUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  return response;
}

export const config = {
  matcher: ['/dashboard', '/generate', '/my-gallery', '/profile']
};