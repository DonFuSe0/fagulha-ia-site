// lib/supabase/browserClient.ts
// Compat: mantém { supabaseBrowser } e reexporta factory a partir do singleton global
export { getSupabase as getSupabaseBrowserClient } from './global-client'
import client from './global-client'
export const supabaseBrowser = client
export default client