'use server';

import { createClient as createServerClient } from './server';

/**
 * Compat: usado como função em server components/pages
 *   import { supabaseServer } from '@/lib/supabase/serverClient'
 *   const supabase = supabaseServer();
 */
export function supabaseServer() {
  return createServerClient();
}

/** Factory explícita (opcional) */
export const createClient = createServerClient;

/** Default export como factory */
export default function getServerClient() {
  return createServerClient();
}
