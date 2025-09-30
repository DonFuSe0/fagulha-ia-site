import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(req: Request) {
  const store = await cookies(); // Next 15: cookies() é assíncrono

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // grava cookie na resposta
        store.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        // remove cookie forçando expiração
        store.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  // IMPORTANTE: passe a URL (string), não o objeto Request
  const { error } = await supabase.auth.exchangeCodeForSession(req.url);

  // Redireciona ao painel; se houver erro, propaga via querystring
  const originBase = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const redirectTo = new URL('/dashboard', originBase);
  if (error) {
    redirectTo.searchParams.set('auth_error', error.message);
  }

  return NextResponse.redirect(redirectTo);
}
