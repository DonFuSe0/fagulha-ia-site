// lib/supabase/global-client.ts
// ÚNICO ponto de criação do cliente Supabase no browser.
// Tudo deve importar a partir daqui, direta ou indiretamente.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Reaproveita entre HMR/navegação
const g = globalThis as unknown as { __supabase?: SupabaseClient }

function _create() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Use uma storageKey fixa para evitar clientes "competindo" em outra chave
      storageKey: 'fagulha-auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: { params: { eventsPerSecond: 3 } },
  })
}

export function getSupabase() {
  if (!g.__supabase) g.__supabase = _create()
  return g.__supabase!
}

// Para compat: algumas partes do código esperam um export default
const client = getSupabase()
export default client