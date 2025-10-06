'use server';

import { createClient as createServerClient } from './server';

/**
 * Compat: usado como função em rotas API
 *   import { supabaseRoute } from '@/lib/supabase/routeClient'
 *   const supabase = supabaseRoute();
 */
export function supabaseRoute() {
  return createServerClient();
}

/** Factory explícita (se alguém importar) */
export const createClient = createServerClient;

/** Default export como factory, caso alguém faça import default e chame */
export default function getRouteClient() {
  return createServerClient();
}
