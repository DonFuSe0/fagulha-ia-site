'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase' // ajuste/remova se não tiver os tipos

// Singleton por módulo; auth-helpers gerenciam cookies automaticamente.
const _supabase = createClientComponentClient<Database>()

// Compat: muitos arquivos no projeto importam { createClient } de './client'.
// Para evitar múltiplas instâncias, `createClient()` retorna o mesmo singleton.
export function createClient() {
  return _supabase
}

// Exports originais/atuais
export const supabase = _supabase
export default _supabase