import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

/** Client SERVER preservando cookies/sessão do usuário. */
export async function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createSupabaseServerClient(url, anon, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set({ name, value, ...options }),
      remove: (name, options) => cookieStore.set({ name, value: "", ...options, maxAge: 0 }),
    },
  });

  return supabase;
}

// alias opcional para manter imports antigos, se existirem
export const createServerClient = createClient;
