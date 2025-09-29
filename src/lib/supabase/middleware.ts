import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Atualiza a sessão Supabase a cada requisição.  Esse middleware
 * revalida o token de autenticação e grava o cookie (via response)
 * com `path: '/'` para que todas as rotas o enxerguem.
 */
export async function updateSession(request: NextRequest) {
  // A resposta padrão seguirá adiante (NextResponse.next())
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lê o cookie da request
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // Escreve o cookie na response (sempre no path '/')
        set(name: string, value: string, options?: any) {
          response.cookies.set(name, value, { path: '/', ...options });
        },
        // Remove o cookie expirando-o
        remove(name: string, options?: any) {
          response.cookies.set(name, '', {
            path: '/',
            maxAge: 0,
            ...options,
          });
        },
      },
    }
  );

  // Revalida o token. A chamada a getUser() renova o cookie internamente.
  await supabase.auth.getUser();

  return response;
}
