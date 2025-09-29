import { createClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client with service‑role access.
 *
 * Use this helper on the server only. It uses the SUPABASE_SERVICE_ROLE_KEY,
 * which has elevated privileges and should never be exposed to the browser.
 */
export function supabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}
