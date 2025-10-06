// lib/supabase/browser-client.ts — singleton do cliente no browser
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let client: ReturnType<typeof createClient> | undefined

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 3 } },
    })
  }
  return client
}