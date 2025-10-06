// lib/supabase/server.ts
// Uso exclusivo no servidor
import 'server-only'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
// import type { Database } from '@/types/supabase' // mantenha se você tiver os tipos

/**
 * Cria um client do Supabase para uso em Server Components,
 * lendo/escrevendo os COOKIES de auth do usuário.
 * Isso evita o loop para /auth/login nas páginas server-side (ex.: /generate).
 */
export function createClient(): SupabaseClient /*<Database>*/ {
  const c = cookies()
  // @ts-ignore helpers inferem os tipos se Database existir
  return createServerComponentClient({ cookies: () => c })
}

// Alias compatível com importações antigas
export { createClient as createServerClient }
export default createClient