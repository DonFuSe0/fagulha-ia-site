import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

/**
 * Helper for route handlers (e.g. API routes or action handlers) to create a
 * Supabase client bound to the current request's cookies. This allows the
 * handler to read/write the auth session when performing operations.
 */
export function supabaseRoute() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
}