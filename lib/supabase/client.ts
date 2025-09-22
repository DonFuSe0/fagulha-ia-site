import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // As variáveis de ambiente que configuramos na Vercel serão usadas aqui
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
