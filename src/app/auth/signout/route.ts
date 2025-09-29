import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST() {
  // cria uma resposta onde vamos escrever os cookies
  const res = new NextResponse(null, { status: 302 });
  res.headers.set('Location', '/');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set(name, value, options) { res.cookies.set(name, value, { path: '/', ...options }); },
        remove(name, options) { res.cookies.set(name, '', { path: '/', maxAge: 0, ...options }); },
      },
    }
  );

  await supabase.auth.signOut();
  return res;
}
