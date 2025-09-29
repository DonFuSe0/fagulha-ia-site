import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que exigem login
const PROTECTED_PATHS = ['/dashboard', '/generate', '/my-gallery', '/profile'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // No Edge, verifique se o cookie de sessão Supabase existe:
  // @supabase/ssr usa, por padrão:
  //  - sb-access-token
  //  - sb-refresh-token
  const hasAccess = !!req.cookies.get('sb-access-token')?.value;
  const hasRefresh = !!req.cookies.get('sb-refresh-token')?.value;

  if (!hasAccess && !hasRefresh) {
    const loginURL = new URL('/auth/login', req.url);
    loginURL.searchParams.set('next', `${pathname}${search || ''}`);
    return NextResponse.redirect(loginURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/my-gallery/:path*',
    '/profile/:path*',
  ],
};
