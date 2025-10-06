'use client';

// Compat layer — aponta SEMPRE para a mesma instância global
import { createClient, supabase as baseSupabase } from './client';

export const supabaseBrowser = baseSupabase;
export const supabase = baseSupabase; // compat extra

export { createClient };

export default baseSupabase;