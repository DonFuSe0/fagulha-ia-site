'use client';
// ... (mantenha os imports e a lógica)
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { useState } from 'react';

export default function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const avatarUrl = user.user_metadata?.avatar_url;

  const handleSignOut = async () => { /* ...lógica existente... */ };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 rounded-full cursor-pointer overflow-hidden border-2 border-primary/50 hover:border-primary transition-colors">
        {avatarUrl ? (
          <Image src={avatarUrl} alt="Avatar" width={48} height={48} className="object-cover" />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center text-primary font-bold text-xl">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface rounded-lg shadow-2xl shadow-primary/10 border border-primary/20 py-2 z-50">
          <div className="px-4 py-3 border-b border-primary/10">
            <p className="text-sm text-text-secondary">Logado como</p>
            <p className="text-base font-medium text-text-main truncate">{user.email}</p>
          </div>
          <div className="py-2">
            <a href="/gallery" className="block px-4 py-2 text-text-main hover:bg-primary/20">Minha Galeria</a>
            <a href="/tokens" className="block px-4 py-2 text-text-main hover:bg-primary/20">Comprar Tokens</a>
          </div>
          <div className="border-t border-primary/10 py-2">
            <button onClick={handleSignOut} className="w-full text-left block px-4 py-2 text-red-400 hover:bg-red-500/20">Sair</button>
          </div>
        </div>
      )}
    </div>
  );
}
