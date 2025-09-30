'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Evita conflito de tipos (Schema) entre versões.
 * Usamos o tipo retornado pela própria factory do @supabase/ssr.
 */
type AnyClient = ReturnType<typeof createBrowserClient<any>>;

let _client: AnyClient | null = null;

/** Fábrica única (singleton por aba) */
export function getSupabaseBrowser(): AnyClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Instancia com generics frouxos pra evitar mismatch de "public"/GenericSchema
  _client = createBrowserClient<any>(supabaseUrl, supabaseAnonKey);
  return _client;
}

/**
 * DEFAULT EXPORT (recomendado)
 * Uso: import supabaseClient from '@/lib/supabase/client'
 */
export default function createSupabaseBrowserClient(): AnyClient {
  return getSupabaseBrowser();
}

/**
 * EXPORTS NOMEADOS (retrocompatibilidade)
 * Uso: import { supabaseBrowser } from '@/lib/supabase/client'
 * Uso: import { supabaseClient } from '@/lib/supabase/client'
 */
export const supabaseBrowser = getSupabaseBrowser;
export const supabaseClient = getSupabaseBrowser;
