import { createClient } from '@supabase/supabase-js';

// Admin (service role) para RPCs e operações server-side que precisam ignorar RLS.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY ou URL ausentes');
  return createClient(url, key, { auth: { persistSession: false } });
}
