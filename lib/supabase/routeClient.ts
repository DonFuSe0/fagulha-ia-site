import 'server-only';
import { createClient as createServerClient } from './server';

/**
 * Uso em rotas (route handlers):
 *   import { supabaseRoute } from '@/lib/supabase/routeClient'
 *   const supabase = supabaseRoute();
 */
export function supabaseRoute() {
  return createServerClient();
}

export const createClient = createServerClient;

export default function getRouteClient() {
  return createServerClient();
}
