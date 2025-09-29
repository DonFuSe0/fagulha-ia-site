import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client para o BROWSER.
 * Usa as variáveis públicas e deve ser chamado somente em componentes client.
 */
export function supabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Alias de compatibilidade — algumas partes do código importam { supabaseClient }.
 * Mantemos esse nome apontando para o mesmo helper acima.
 */
export function supabaseClient() {
  return supabaseBrowser();
}
