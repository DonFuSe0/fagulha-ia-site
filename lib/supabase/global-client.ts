// lib/supabase/global-client.ts
// Ensure 'supabase' is in scope; then export helpers for legacy imports.
'use client'

import supabaseDefault, { supabase as _supabase, createClient as _createClient } from './client'

export const supabase = _supabase
export const createClient = _createClient
export function getSupabase() {
  return _supabase
}

export default supabaseDefault