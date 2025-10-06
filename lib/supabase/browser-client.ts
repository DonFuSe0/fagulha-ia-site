// lib/supabase/browser-client.ts — singleton global para evitar múltiplos GoTrueClient
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Reaproveita entre HMR/páginas
const g = globalThis as unknown as { __supabase?: SupabaseClient }

export function getSupabaseBrowserClient() {
  if (!g.__supabase) {
    g.__supabase = createClient(supabaseUrl, supabaseAnonKey, {
      // Ajuste fino opcional
      auth: {
        // storageKey consistente; mantenha default se já usa em produção
        // storageKey: 'fagulha-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: { params: { eventsPerSecond: 3 } },
    })
  }
  return g.__supabase!
}