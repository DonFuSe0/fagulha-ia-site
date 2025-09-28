import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Creates a server‑side Supabase client configured to persist the user's
 * session in HTTP‑only cookies.  `@supabase/ssr` expects an object with
 * explicit `get`, `set`, and `remove` functions to read and write
 * cookies.  Passing the `cookies()` function directly causes a TypeScript
 * error because it does not match the required interface.
 *
 * This helper should only be used in server contexts (server actions,
 * API routes, or server components).  Do not expose the service role key
 * to the browser.
 */
export function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  // Obtain the cookie store for the current request.  Each invocation of
  // `cookies()` returns a new instance bound to the request context.
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      /**
       * Retrieve a cookie value by name.  Returns undefined if the
       * cookie is not set.
       */
      get(name: string) {
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      /**
       * Set a cookie using Next.js's ResponseCookies API.  Accepts
       * optional serialization options such as `maxAge`, `expires`, etc.
       */
      set(name: string, value: string, options?: any) {
        cookieStore.set(name, value, options);
      },
      /**
       * Remove a cookie by name.  Accepts optional options (e.g. path).
       */
      remove(name: string, options?: any) {
        cookieStore.delete(name, options);
      },
    },
  });
}
