import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Creates a server‑side Supabase client using cookies for session
// persistence.  The service role key is included in environment
// variables but should never be exposed to the client.  Use this
// client in server actions and API routes only.
export function supabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies
  });
}