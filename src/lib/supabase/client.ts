'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Client no browser sem tipagem rígida do schema (evita conflitos).
 * Reutiliza a instância num singleton simples.
 */
let _client: ReturnType<typeof createBrowserClient> | null = null;

export default function supabaseBrowser() {
  if (_client) return _client;

  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return _client;
}
