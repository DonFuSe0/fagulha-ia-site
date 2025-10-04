// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
// compatível com projetos antigos e novos
const key =
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ??
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)

if (!url || !key) {
  // Ajuda a detectar em build/deploy se faltou variável
  // (não joga erro aqui pra não quebrar o build local de tipagem)
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou ...ANON_KEY)'
  )
}

export function createClient(): SupabaseClient {
  return createSupabaseClient(url, key)
}
