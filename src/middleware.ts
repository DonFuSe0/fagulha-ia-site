import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/ssr';

export const config = {
  matcher: [
    // tudo exceto assets, callback de auth e webhooks
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml|images|public|auth/callback|api/webhooks).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Atualiza/renova sessão no Edge
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();

  // Verifica usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/auth');
  const isProtected = ['/dashboard', '/generate', '/my-gallery', '/profile'].some((p) =>
    pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}
