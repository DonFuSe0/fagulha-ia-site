'use client'; // Este componente precisa ser do cliente para ter interatividade (menu dropdown)

import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
// Supondo que você tenha um ícone de moeda/token
import { Coins } from 'lucide-react'; 

// Definimos os tipos de dados que o componente espera receber
interface UserMenuProps {
  user: User;
  profile: {
    token_balance: number | null;
    avatar_url: string | null;
  };
}

export default function UserMenu({ user, profile }: UserMenuProps) {
  // Lógica do menu dropdown (abrir/fechar) ficaria aqui

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 py-1.5 px-3 rounded-full">
        <Coins className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-white">{profile.token_balance ?? 0}</span>
      </div>
      
      {/* Lógica do Dropdown aqui */}
      <div className="relative">
          <Image
            src={profile.avatar_url || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.id}`}
            alt="Avatar do usuário"
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
          />
          {/* Aqui entraria o menu dropdown com links para /profile, /gallery e o botão de Logout */}
      </div>
    </div>
   );
}
