'use client';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// === SINGLETON GLOBAL ===
// Garante uma ÚNICA instância no browser, mesmo com HMR/chunks/múltiplos imports.
const g = globalThis as unknown as { __fagulhaSupabase?: SupabaseClient };

function getOrCreateClient(): SupabaseClient {
  if (g.__fagulhaSupabase) return g.__fagulhaSupabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  g.__fagulhaSupabase = createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // storageKey único/estável para evitar conflito entre instâncias
      storageKey: 'fagulha-auth',
    },
  });

  return g.__fagulhaSupabase;
}

// Mantém API existente
export function createClient(): SupabaseClient {
  return getOrCreateClient();
}

export const supabase = getOrCreateClient();

export type { SupabaseClient };