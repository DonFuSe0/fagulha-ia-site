import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Initialize a Supabase client for use in client components.
// It relies on the public URL and anon key defined in environment variables.
export const supabaseBrowser = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);