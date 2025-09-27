// lib/supabase/server.ts
import { cookies } from "next/headers";
import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";

/**
 * Cria um client do Supabase no SERVER (RSC/route handlers),
 * preservando cookies/sessão do usuário.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

/** Alias para retrocompatibilidade (outros módulos importam { createServerClient }) */
export const createServerClient = createClient;
