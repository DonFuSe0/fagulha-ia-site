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
  // Prepare a response object to attach cookies and headers.
  const response = new NextResponse();
  // Create a Supabase client that reads cookies from the incoming
  // request and writes cookies to our response with a root path.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          response.cookies.set(name, value, { path: '/', ...options });
        },
        remove(name: string, options?: any) {
          response.cookies.set(name, '', { path: '/', maxAge: 0, ...options });
        },
      },
    },
  );

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    try {
      // Exchange the authorization code for a session.  Supabase will
      // write the session cookies via our cookie handler.
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('Erro ao trocar código por sessão', err);
    }
  }

  // Always read the origin before any asynchronous calls that might
  // mutate the URL object; this prevents `origin` from being
  // undefined after awaiting Supabase functions.
  const origin = url.origin;
  // Validate the user session.  getUser() will revalidate the token.
  const { data, error } = await supabase.auth.getUser();
  // Determine where to redirect: to the dashboard if logged in, or
  // back to the login page if not.
  const destination = !error && data?.user ? '/dashboard' : '/auth/login';
  // Set the Location header for a 302 redirect.  We return the
  // response object with the updated status and headers.
  response.headers.set('Location', new URL(destination, origin).toString());
  response.status = 302;
  return response;
}
