// lib/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const key =
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ??
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)

export function createClient(): SupabaseClient {
  const cookieStore = cookies()

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options })
      }
    }
  })
}
