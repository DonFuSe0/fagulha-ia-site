import 'server-only';
import { createClient as createServerClient } from './server';

/**
 * Compat: usado em server components/pages:
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
