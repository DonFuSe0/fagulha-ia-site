import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Rotas que exigem login:
const PROTECTED_PREFIXES = ['/dashboard', '/generate', '/my-gallery', '/profile'];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Deixa passar estáticos e o callback
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth/callback') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|txt|xml)$/)
  ) {
    return NextResponse.next();
  }

  // Detecta cookie de sessão do Supabase (sb-xxxx-auth-token)
  const hasAuthCookie = req.cookies.getAll().some((c) => c.name.endsWith('-auth-token'));

  // Exige sessão nas páginas protegidas
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!hasAuthCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
      return NextResponse.redirect(url);
    }
  }

  // Evita acessar login/cadastro quando já está logado
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
