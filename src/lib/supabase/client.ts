import { createBrowserClient } from '@supabase/ssr';

/**
 * Retorna um client do Supabase configurado para o browser.
 * Use em Client Components e handlers de eventos.
 */
export function supabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Alias mantido para compatibilidade com imports existentes:
 *   import { supabaseClient } from '@/lib/supabase/client';
 */
export const supabaseClient = supabaseBrowser;
