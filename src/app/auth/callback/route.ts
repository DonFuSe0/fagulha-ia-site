import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Garante Node runtime (precisamos de cookies mutáveis)
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Troca code+verifier por sessão e escreve cookies
  const { error } = await supabase.auth.exchangeCodeForSession(req);

  // Redireciona para o painel; se houve erro, manda parâmetro pra UI tratar
  const xfHost = headers().get('x-forwarded-host');
  const base = xfHost ? `https://${xfHost}` : process.env.NEXT_PUBLIC_SITE_URL!;
  const url = new URL('/dashboard', base);
  if (error) url.searchParams.set('auth_error', error.message);

  return NextResponse.redirect(url);
}
