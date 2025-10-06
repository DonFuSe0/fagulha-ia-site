// lib/supabase/browserClient.ts
// Compat layer: mantém o antigo `supabaseBrowser` para código existente.
// Passa a usar o singleton definido em './browser-client'.
import { getSupabaseBrowserClient } from './browser-client'

// Instância única para quem importava { supabaseBrowser }
export const supabaseBrowser = getSupabaseBrowserClient()

// Também exporta a factory nova, caso queira migrar gradualmente
export { getSupabaseBrowserClient }