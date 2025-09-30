'use client';

import { useRouter } from 'next/navigation';
import supabaseBrowser from '@/lib/supabase/client';

export default function SignOutButton({ className = '' }: { className?: string }) {
  const router = useRouter();

  async function onSignOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <button
      onClick={onSignOut}
      className={className || 'rounded-md border px-3 py-2 text-sm hover:bg-accent'}
    >
      Sair
    </button>
  );
}
