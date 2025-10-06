// lib/supabase/browserClient.ts
// FULL compat (camelCase path)
'use client'

import supabaseDefault, { supabase as _supabase, createClient as _createClient } from './client'

export const supabaseBrowser = _supabase
export const supabase = _supabase
export const createClient = _createClient
export function getSupabaseBrowserClient() {
  return _supabase
}
export default supabaseDefault