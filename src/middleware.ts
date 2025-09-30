import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@supabase/ssr';

// Mantém a sessão do Supabase em rotas do app (evita "sumir" login em navegações)
// Ajuste o matcher conforme suas rotas autenticadas
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  await updateSession({ request, response });
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/gerar/:path*',
    '/minha-galeria/:path*',
    '/profile/:path*',
  ],
};
