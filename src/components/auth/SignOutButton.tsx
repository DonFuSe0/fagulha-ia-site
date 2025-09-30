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

  const handleSignOut = async () => {
    try {
      const supabase = supabaseClient();
      await supabase.auth.signOut();
      router.replace('/auth/login');
      router.refresh();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  return (
    <button onClick={handleSignOut} className={className}>
      {children ?? 'Sair'}
    </button>
  );
}
