'use server';

// Para Route Handlers (API do Next) reaproveitamos a mesma factory do server
import { createClient as createServerClient } from './server';

/**
 * Compat com imports antigos:
 *   import { supabaseRoute } from '@/lib/supabase/routeClient'
 */
export const supabaseRoute = createServerClient();

/** Também expõe a factory */
export const createClient = createServerClient;

/** Default export para compatibilidade */
export default createServerClient;
