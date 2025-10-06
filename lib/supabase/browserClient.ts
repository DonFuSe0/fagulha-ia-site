// lib/supabase/browserClient.ts
// Compat shim — mantém o caminho antigo esperado pelos componentes.
// Reexporta a mesma instância global única criada em './client'.
'use client'

import { supabase as baseSupabase, createClient } from './client'

// API esperada pelo código existente
export const supabaseBrowser = baseSupabase
export const supabase = baseSupabase // extra de compat
export { createClient }

export default baseSupabase