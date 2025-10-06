// NUNCA use "use server" aqui.
// Este arquivo deve ser carregado apenas no servidor.
import 'server-only';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cria um client do Supabase para uso no SERVIDOR.
 * Usa SERVICE_ROLE_KEY se existir (apenas no server), senão cai no ANON.
 * NÃO exponha SERVICE_ROLE_KEY em client code.
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Em produção, mantenha apenas SERVICE_ROLE_KEY no ambiente do servidor.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(url, key, {
    auth: {
      // No server não precisamos persistir sessão no storage
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Alias compatível com os outros helpers
export { createClient as createServerClient };

// Export default opcional
export default createClient;
