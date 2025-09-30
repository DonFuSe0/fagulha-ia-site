'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Mantemos uma única instância por aba.
 */
let _client: SupabaseClient | null = null;

/**
 * Função real que cria/retorna o client.
 * Damos um nome "neutro" para poder reexportar com vários aliases
 * (default, supabaseBrowser, supabaseClient) e não quebrar nada.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

/**
 * Export default (recomendado): import supabaseClient from '@/lib/supabase/client'
 */
export default function supabaseClient(): SupabaseClient {
  return getSupabaseBrowser();
}

/**
 * Exports nomeados para compatibilidade com código antigo:
 * - import { supabaseBrowser } from '@/lib/supabase/client'
 * - import { supabaseClient } from '@/lib/supabase/client'
 */
export const supabaseBrowser = getSupabaseBrowser;
export const supabaseClient = getSupabaseBrowser;
