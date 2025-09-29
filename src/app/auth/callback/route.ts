import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Handles the OAuth callback from Supabase.  After the user
 * authenticates with Google (or another provider), Supabase
 * redirects back to this route with a `code` query parameter.  We
 * exchange that code for a session and persist the session in
 * cookies using a custom cookie handler.  Finally, we redirect
 * the user to the dashboard if logged in, or back to the login page.
 */
export async function GET(request: NextRequest) {
  // We collect cookies to set after the session exchange completes.  We
  // cannot assign to `response.status` directly because it is a read‑only
  // property on NextResponse.  Instead, we gather the cookies in an
  // array and apply them to a new redirect response at the end.
  const cookiesToSet: Array<{ name: string; value: string; options?: any }> = [];

  // Construct a Supabase client that reads cookies from the request
  // and stores new cookies in our temporary array.  All cookies are
  // written with `path: '/'` to ensure they apply to every route.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          cookiesToSet.push({ name, value, options });
        },
        remove(name: string, options?: any) {
          cookiesToSet.push({ name, value: '', options: { maxAge: 0, ...options } });
        },
      },
    },
  );

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    try {
      // Exchange the authorization code for a session.  Supabase will
      // invoke our cookie handler to record any cookies that need to be
      // set.  We do not await the response of exchangeCodeForSession to
      // avoid unhandled promise warnings.
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('Erro ao trocar código por sessão', err);
    }
  }

  // Capture the origin early, before further async operations mutate
  // the URL object.  This prevents `origin` from becoming undefined.
  const origin = url.origin;
  // Validate the user session.  getUser() will revalidate the token.
  const { data, error } = await supabase.auth.getUser();
  const destination = !error && data?.user ? '/dashboard' : '/auth/login';

  // Create a redirect response with the appropriate status code.  We
  // copy any cookies collected during the session exchange onto this
  // response.  NextResponse.redirect accepts a URL object and an
  // optional status code (defaults to 307).  We explicitly set 302.
  const redirectResponse = NextResponse.redirect(
    new URL(destination, origin),
    { status: 302 },
  );
  cookiesToSet.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(
      name,
      value,
      { path: '/', ...options },
    );
  });
  return redirectResponse;
}
