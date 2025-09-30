import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Callback OAuth (Google e e-mail link). Compatível com Next.js 15.5.
 * - Usa cookies() assíncrono (Next 15)
 * - Faz exchange do "code" por sessão (Supabase)
 * - Grava cookies no Response e redireciona pro /dashboard
 */
export async function GET(req: Request) {
  const cookieStore = await cookies(); // Next 15: API assíncrona

  // Sempre respondemos com um redirect, e os cookies serão gravados nesse response
  const response = new NextResponse(null, { status: 302 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // NÃO retornar nada (void). Gravamos no response.
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Para remover, gravamos com maxAge 0 no response
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  // Troca o "code" da URL pela sessão. O verifier sai do cookie gerenciado pelo @supabase/ssr
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Em caso de erro, mande o usuário de volta ao login com a msg
      response.headers.set(
        'Location',
        `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/login?error=${encodeURIComponent(error.message)}`
      );
      return response;
    }
  }

  // Sucesso: manda pro dashboard
  response.headers.set(
    'Location',
    `${process.env.NEXT_PUBLIC_SITE_URL || ''}/dashboard`
  );
  return response;
}
