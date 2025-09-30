import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /auth/callback
export async function GET(req: NextRequest) {
  // Em Next 15.5, cookies() é assíncrono
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // IMPORTANTE: não retornar o ResponseCookies; apenas executar e sair (retorna void)
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // zera o cookie
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  // Troca code + verifier por sessão e grava os cookies.
  // Em versões recentes, passe a URL (string) — NÃO passe o objeto Request.
  const { error } = await supabase.auth.exchangeCodeForSession(req.url);

  // Redireciona para o painel (ou com erro na query, se houver)
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const dest = error
    ? `/auth/login?error=${encodeURIComponent(error.message)}`
    : '/dashboard';

  const location = new URL(dest, base).toString();
  const res = NextResponse.redirect(location, { status: 302 });

  return res;
}
