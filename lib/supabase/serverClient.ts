import 'server-only';
import { createClient as createServerClient } from './server';

/**
 * Uso em server components/pages:
 *   import { supabaseServer } from '@/lib/supabase/serverClient'
 *   const supabase = supabaseServer();
 */
export function supabaseServer() {
  return createServerClient();
}

export const createClient = createServerClient;

export default function getServerClient() {
  return createServerClient();
}
