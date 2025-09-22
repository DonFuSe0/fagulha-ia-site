'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';

// O componente agora espera receber o objeto 'user'
export default function UserMenu({ user }: { user: User }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Força a atualização da rota para limpar o estado
  };

  // Pega a URL do avatar das metadados do usuário (fornecido pelo Google)
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      {/* Avatar do Usuário */}
      <div className="w-10 h-10 rounded-full cursor-pointer overflow-hidden">
        {avatarUrl ? (
          <Image 
            src={avatarUrl} 
            alt="Avatar do usuário" 
            width={40} 
            height={40} 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* O menu dropdown em si. Vamos adicionar a lógica de abrir/fechar depois. */}
      {/* Por enquanto, ele está visível para podermos ver o estilo. */}
      <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-50">
        <div className="px-4 py-2 border-b border-gray-700">
          <p className="text-sm text-gray-300">Logado como</p>
          <p className="text-sm font-medium text-white truncate">{user.email}</p>
        </div>
        <a href="/gallery" className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600">
          Minha Galeria
        </a>
        <a href="/tokens" className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600">
          Comprar Tokens
        </a>
        <button
          onClick={handleSignOut}
          className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-purple-600"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
