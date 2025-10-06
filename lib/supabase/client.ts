"use client";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Evita acessar localStorage no server
  const options: Parameters<typeof createSupabaseClient>[2] = {
    auth: {
      persistSession: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  };

  _client = createSupabaseClient(url, key, options);
  return _client;
}

// Conveniência: quem preferir pode importar { supabase } direto
export const supabase = createClient();
