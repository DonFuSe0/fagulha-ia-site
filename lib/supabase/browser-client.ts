// lib/supabase/browser-client.ts
// FULL compat: provides default, supabaseBrowser, supabase, createClient, getSupabaseBrowserClient
'use client'

import supabaseDefault, { supabase as _supabase, createClient as _createClient } from './client'

// Old API
export const supabaseBrowser = _supabase
export const supabase = _supabase
export const createClient = _createClient

// Compat name used in some components
export function getSupabaseBrowserClient() {
  return _supabase
}

// Default export for interop
export default supabaseDefault