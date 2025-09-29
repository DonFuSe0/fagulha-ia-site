import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Callback do OAuth (Google).
 * Troca o `code` por sessão e grava os cookies na própria resposta de redirect.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;

  // Para onde vamos após o login
  const destination = url.searchParams.get('redirect') || '/dashboard';

  // Cria a resposta de REDIRECT (302). Vamos escrever os cookies nela.
  const redirect = NextResponse.redirect(new URL(destination, origin), 302);

  // Cliente Supabase que:
  // - Lê cookies da request
  // - Escreve cookies na *resposta de redirect* (sempre com path '/')
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          redirect.cookies.set(name, value, { path: '/', ...options });
        },
        remove(name: string, options?: any) {
          redirect.cookies.set(name, '', { path: '/', maxAge: 0, ...options });
        },
      },
    }
  );

  // Troca o código pelo token de sessão (se existir na URL)
  const code = url.searchParams.get('code') ?? undefined;
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Força revalidação para garantir que o cookie foi setado
  await supabase.auth.getUser();

  // Retorna o redirect já contendo os cookies gravados
  return redirect;
}
