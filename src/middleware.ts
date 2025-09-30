import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Middleware de proteção de rotas usando @supabase/ssr.
 * Não use createMiddlewareClient (não existe neste pacote).
 */
export async function middleware(req: NextRequest) {
  // Resposta “next()” onde iremos gravar cookies, se necessário
  const res = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // lê a partir do request
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      // grava no response
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      // remove do response (expira)
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  // Obtém sessão atual
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Ajuste aqui as rotas que exigem login
  const protectedPaths = [
    '/dashboard',
    '/generate',
    '/gerar',
    '/gallery',
    '/minha-galeria',
    '/profile',
    '/perfil',
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Telas de auth
  const isAuthPage = pathname.startsWith('/auth');

  // Sem sessão tentando acessar protegido -> manda pro login
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url, { headers: res.headers });
  }

  // Já logado e indo pra /auth/* -> manda pro painel
  if (isAuthPage && session) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url, { headers: res.headers });
  }

  // segue o fluxo normal
  return res;
}

/**
 * Defina quais rotas passam pelo middleware.
 * (middleware SEMPRE roda em Edge Runtime)
 */
export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/generate/:path*',
    '/gerar/:path*',
    '/gallery/:path*',
    '/minha-galeria/:path*',
    '/profile/:path*',
    '/perfil/:path*',
  ],
};
