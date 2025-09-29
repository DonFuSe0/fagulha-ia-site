// Caminho: src/lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  if (!url || !anon) {
    throw new Error('Ambiente inválido: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createBrowserClient(url, anon);
}

// Alias para quem estiver importando "supabaseBrowser"
export const supabaseBrowser = supabaseClient;

// Default export opcional (facilita import default)
export default supabaseClient;
