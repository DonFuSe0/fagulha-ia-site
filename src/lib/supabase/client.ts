import { createBrowserClient } from '@supabase/ssr';

// Initialize a Supabase client for the browser.  The anon key and URL
// are exposed via NEXT_PUBLIC_ environment variables.  This client
// does not have privileged access and should only be used on the
// client side.
export function supabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}