import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Precisamos de runtime Node para manipular cookies de resposta
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const store = await cookies(); // <- Next 15 retorna Promise

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          // Em route handlers, set(name, value, options) é suportado
          store.set(name, value, options);
        },
        remove(name: string) {
          // Em route handlers, delete só recebe o nome
          store.delete(name);
        },
      },
    }
  );

  // Troca code + verifier por sessão e grava os cookies
  const { error } = await supabase.auth.exchangeCodeForSession(req);

  // Redireciona sempre para o painel; se tiver erro, repassa na query
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const url = new URL('/dashboard', base);
  if (error) url.searchParams.set('auth_error', error.message);

  return NextResponse.redirect(url);
}
