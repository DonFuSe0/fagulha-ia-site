// lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "../env";

export const supabaseBrowser = () =>
  createClientComponentClient({
    supabaseUrl: env.client.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
