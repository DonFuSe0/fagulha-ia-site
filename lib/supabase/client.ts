"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Client para o BROWSER com sessão real do usuário (cookies). */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, anon);
}
