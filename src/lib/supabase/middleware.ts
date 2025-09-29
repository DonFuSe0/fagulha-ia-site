import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Updates the Supabase session on each request by revalidating the
 * authentication token and writing any updated cookies back to the
 * response.  This function must be called from a Next.js
 * middleware; it uses the request's cookies to construct a
 * `createServerClient` instance and writes refreshed cookies to a
 * `NextResponse` with `path: '/'` so that the token is available
 * across the entire application.
 *
 * @param request The incoming Next.js request from the middleware.
 * @returns A NextResponse object containing any updated cookies.
 */
export async function updateSession(request: NextRequest) {
  // Create a new response to attach cookies.  We use
  // NextResponse.next() rather than `new NextResponse()` so that
  // Next.js continues processing the request after the middleware.
  const response = NextResponse.next();

  // Construct a Supabase server client with custom cookie handlers.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the request.
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // Write cookies to the response using a root path so they
        // apply globally.  Additional options override defaults.
        set(name: string, value: string, options?: any) {
          response.cookies.set(name, value, { path: '/', ...options });
        },
        // Remove cookies by setting an empty value and a maxAge of
        // zero.  This effectively expires the cookie.
        remove(name: string, options?: any) {
          response.cookies.set(name, '', { path: '/', maxAge: 0, ...options });
        },
      },
    },
  );

  // Revalidate the user's session.  Calling getUser() triggers
  // Supabase to refresh the token if necessary and update the
  // `supabase-auth-token` cookie.
  await supabase.auth.getUser();

  return response;
}
