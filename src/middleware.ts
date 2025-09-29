import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// Ajuste conforme suas rotas que exigem login
const PROTECTED_PATHS = [
  '/dashboard',
  '/generate',
  '/my-gallery',
  '/profile',
];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Lê sessão do cookie no edge/SSR
  // OBS: supabaseServer usa cookies() do Next 15 corretamente
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    const login = new URL('/auth/login', req.url);
    // mantém a rota de retorno
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
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
