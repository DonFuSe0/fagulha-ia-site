'use client';

// Reaproveita o client já configurado em ./client
import {
  supabase as baseSupabase,
  createClient as baseCreateClient,
} from './client';

/**
 * Compatibilidade com imports antigos:
 *   import { supabaseBrowser } from '@/lib/supabase/browserClient'
 */
export const supabaseBrowser = baseSupabase;

/** Compat extra (se houver lugares usando { supabase }) */
export const supabase = baseSupabase;

/** Reexport da factory do client do browser */
export const createClient = baseCreateClient;

/** Default export para quem usava import default */
export default baseSupabase;
