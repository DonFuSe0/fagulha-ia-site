import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Client de servidor (Next 15+):
 * - cookies() agora é ASSÍNCRONO -> await cookies()
 * - Métodos get/set/remove devem retornar void (não retornar valores)
 */
export async function supabaseServer() {
  const cookieStore = await cookies(); // <<<<<<<<<< IMPORTANTE no Next 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // não retornar nada (void)
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // não retornar nada (void)
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}
