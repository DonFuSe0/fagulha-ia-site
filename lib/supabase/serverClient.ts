import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

/**
 * Returns a Supabase client for use inside Server Components. The client
 * automatically forwards cookies to Supabase to retrieve the current auth
 * session.
 */
export function supabaseServer() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}