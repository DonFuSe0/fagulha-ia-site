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
  /*
   * Next.js 15 makes `cookies()` asynchronous, returning a Promise.  We
   * therefore avoid capturing the cookie store synchronously.  Instead,
   * each cookie method retrieves the current cookie store on demand
   * and awaits it.  The returned functions are async but `createServerClient`
   * will handle their Promises.  This keeps `supabaseServer` itself
   * synchronous, so call sites don't need to `await` it.
   */
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Get a cookie value.  Returns a Promise that resolves to the
      // cookie's value or undefined.
      async get(name: string) {
        const store = await cookies();
        const cookie = store.get(name);
        return cookie?.value;
      },
      // Set a cookie.  Accepts optional options like `maxAge`, `expires`, etc.
      async set(name: string, value: string, options?: any) {
        const store = await cookies();
        store.set(name, value, options);
      },
      // Remove a cookie by name.
      async remove(name: string, options?: any) {
        const store = await cookies();
        store.delete(name, options);
      },
    },
  });
}
