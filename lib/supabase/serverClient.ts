'use server';

// Usa a mesma factory do server que você já tem em ./server
import { createClient as createServerClient } from './server';

/**
 * Compat com imports antigos:
 *   import { supabaseServer } from '@/lib/supabase/serverClient'
 * Obs: como é server-side, podemos instanciar no import com segurança.
 */
export const supabaseServer = createServerClient();

/** Também exporta a factory pra quem preferir chamar dentro do handler */
export const createClient = createServerClient;

/** Helper opcional (se quiser pegar um por chamada) */
export function getServerClient() {
  return createServerClient();
}

/** Default export para compatibilidade */
export default createServerClient;
