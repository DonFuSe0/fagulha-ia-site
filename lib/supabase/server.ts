// lib/supabase/server.ts
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const key =
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ??
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)

if (!url || !key) {
  console.warn('[supabase] URL ou chave pública não configuradas')
}

export function createClient(): SupabaseClient {
  return createSupabaseClient(url, key, {
    global: {
      // habilita uso de cookies automaticamente (opcional)
      headers: {
        Authorization: cookies().get('sb-access-token')?.value ?? ''
      }
    }
  })
}
