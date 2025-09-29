"use client";

import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

/**
 * A button that signs the user out using the Supabase client and then
 * refreshes the current page.  This component is client-side only.
 */
export default function SignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    // Refresh the page to update the auth state.  You could also push to the
    // login page explicitly if desired.
    router.push('/auth/login');
  };
  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-sm hover:text-primary"
    >
      Sair
    </button>
  );
}
