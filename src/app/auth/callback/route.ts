import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: any) =>
          cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  );

  // Troca code+verifier por sessão e grava cookies
  const { error } = await supabase.auth.exchangeCodeForSession(new URL(req.url));

  const base = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, '');
  const dest = error ? `/login?error=${encodeURIComponent(error.message)}` : '/dashboard';

  const res = NextResponse.redirect(`${base}${dest}`, { status: 302 });
  return res;
}
