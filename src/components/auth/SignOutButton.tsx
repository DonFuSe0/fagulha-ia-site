'use client';

import { useRouter } from 'next/navigation';
import supabaseClient from '@/lib/supabase/client';

export default function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      const supabase = supabaseClient();
      await supabase.auth.signOut();
      router.replace('/auth/login');
      router.refresh();
    } catch (e) {
      // opcional: exibir toast
      console.error('Erro ao sair:', e);
    }
  }

  return (
    <button onClick={handleSignOut} className={className}>
      {children ?? 'Sair'}
    </button>
  );
}
