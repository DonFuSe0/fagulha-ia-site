import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const { nextUrl, headers } = req;

  const res = NextResponse.next({
    request: { headers: new Headers(headers) },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  // Atualiza cookies se necessário (refresh)
  await supabase.auth.getUser();

  // Protege rotas do painel
  const protectedPaths = ['/dashboard', '/generate', '/profile', '/minha-galeria'];
  if (protectedPaths.includes(nextUrl.pathname)) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('from', nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/dashboard', '/generate', '/profile', '/minha-galeria', '/login'],
};
