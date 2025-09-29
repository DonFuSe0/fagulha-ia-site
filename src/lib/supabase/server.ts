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
      /**
       * Read a cookie value from the current request.  The Supabase
       * client will call this method to access the `supabase-auth-token`
       * cookie on the server.  We return the cookie's string value or
       * undefined if it doesn't exist.
       */
      async get(name: string) {
        const store = await cookies();
        const cookie = store.get(name);
        return cookie?.value;
      },
      /**
       * Write a cookie.  To ensure that the session cookie is
       * available on all routes (and not just the current path), we
       * explicitly set `path: '/'` on every cookie we write.  Any
       * options passed in will override the defaults (except for
       * `path`).
       */
      async set(name: string, value: string, options?: any) {
        const store = await cookies();
        const opts = { path: '/', ...options };
        store.set(name, value, opts);
      },
      /**
       * Remove a cookie.  The Next.js cookie API does not allow
       * passing options to `delete()`.  Therefore we always
       * overwrite the cookie at the root path with an empty value and
       * `maxAge: 0` to effectively expire it.  Additional options
       * (e.g. domain) can be passed in to override the defaults.
       */
      async remove(name: string, options?: any) {
        const store = await cookies();
        const opts = { path: '/', ...options, maxAge: 0 };
        store.set(name, '', opts);
      },
    },
  });
}
