// lib/supabase/global-client.ts — compat para imports antigos
'use client'
export { default as default, supabase, createClient } from './client'
export const getSupabase = () => supabase