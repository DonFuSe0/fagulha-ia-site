import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/generate', '/my-gallery', '/profile'];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Deixa passar estáticos e o callback de auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth/callback') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|txt|xml)$/)
  ) {
    return NextResponse.next();
  }

  // 🔧 NOVO: detecção robusta do cookie de sessão do Supabase
  const hasAuthCookie = req.cookies.getAll().some((c) =>
    /sb-[a-z0-9]+-auth-token(\.\d+)?$/i.test(c.name) || c.name === 'supabase-auth-token'
  );

  // Exigir login nas rotas protegidas
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!hasAuthCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
      return NextResponse.redirect(url);
    }
  }

  // Evitar acessar login/cadastro estando logado
  if ((pathname === '/auth/login' || pathname.startsWith('/auth/sign-up')) && hasAuthCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!favicon.ico|robots.txt|sitemap.xml).*)'],
};
