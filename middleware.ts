import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware global: atualiza a sessão do Supabase antes de cada request.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Evita rodar o middleware em rotas de assets, imagens e favicon.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
