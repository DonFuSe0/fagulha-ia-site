'use server';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente do Supabase para uso no SERVER (route handlers, actions).
 * Se você tiver SUPABASE_SERVICE_ROLE_KEY no Vercel (Environment Variables),
 * ele será usado no servidor; caso contrário cai no ANON_KEY.
 * NÃO exponha o service role no client!
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, key);
}
