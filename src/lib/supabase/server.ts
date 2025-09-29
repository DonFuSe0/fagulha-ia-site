import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Client para uso no servidor (Route Handlers / Server Components).
 * Implementa CookieMethods com cookies() assíncrono do Next 15.
 */
export function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        return (await cookies()).get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        (await cookies()).set(name, value, options);
      },
      // assinatura espera 2 args; ignoramos options e usamos delete simples
      async remove(name: string, _options?: CookieOptions) {
        (await cookies()).delete(name);
      },
    },
  });
}
