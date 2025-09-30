'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Instância única por aba
 */
let _client: SupabaseClient | null = null;

/**
 * Fábrica real do client (base para todos os exports)
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

/**
 * DEFAULT EXPORT
 * (nome diferente para não colidir com export nomeado "supabaseClient")
 * Uso: import supabaseClient from '@/lib/supabase/client'
 */
export default function createSupabaseBrowserClient(): SupabaseClient {
  return getSupabaseBrowser();
}

/**
 * EXPORTS NOMEADOS (compatibilidade com código antigo):
 * Uso: import { supabaseBrowser } from '@/lib/supabase/client'
 * Uso: import { supabaseClient } from '@/lib/supabase/client'
 */
export const supabaseBrowser = getSupabaseBrowser;
export const supabaseClient = getSupabaseBrowser;
