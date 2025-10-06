'use client';

import {
  supabase as baseSupabase,
  createClient as baseCreateClient,
} from './client';

/**
 * No browser, normalmente usamos a instância única.
 * Compat com:
 *   import { supabaseBrowser } from '@/lib/supabase/browserClient'
 */
export const supabaseBrowser = baseSupabase;

/** Compat extra para quem importa { supabase } do browser */
export const supabase = baseSupabase;

/** Se alguém quiser fabricar outro client (raro no browser) */
export const createClient = baseCreateClient;

/** Default export */
export default baseSupabase;
