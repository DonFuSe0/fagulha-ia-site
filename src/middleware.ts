import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Defina aqui as rotas protegidas que exigem login
const PROTECTED_PREFIXES = ['/dashboard', '/generate', '/my-gallery', '/profile'];

// Exclui assets, favicon etc. e permite o callback do OAuth passar sem bloqueio
export const config = {
  matcher: [
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml|images|public|auth/callback|api/webhooks).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // cria um client no middleware usando cookies de req/res
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options?: any) => {
          // Em middleware, escrevemos no response
          res.cookies.set(name, value, options);
        },
        remove: (name: string, options?: any) => {
          // Em middleware não há delete direto: setamos maxAge 0
          res.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Atualiza/valida sessão
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/auth');
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Bloqueia acesso às protegidas se não autenticado
  if (needsAuth && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // Se já logado e for rota de auth, manda pro painel
  if (isAuthRoute && user) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}
