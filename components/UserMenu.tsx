'use client';

import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { Coins, LogOut, User as UserIcon, Settings, GalleryHorizontal } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Supondo que você use ShadCN/UI, ajuste se necessário

// Tipos para os dados que o componente recebe
interface ProfileData {
  token_balance: number | null;
  avatar_url: string | null;
  username: string | null;
}

interface UserMenuProps {
  user: User;
  profile: ProfileData;
}

export default function UserMenu({ user, profile }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Força a atualização da página e rotas do servidor
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 py-1.5 px-3 rounded-full">
        <Coins className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-white">{profile.token_balance ?? 0}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer">
            <span className="text-white font-medium hidden sm:inline">{profile.username || user.email}</span>
            <Image
              src={profile.avatar_url || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.id}`}
              alt="Avatar do usuário"
              width={40}
              height={40}
              className="rounded-full border-2 border-purple-500"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/gallery">
              <GalleryHorizontal className="mr-2 h-4 w-4" />
              <span>Minha Galeria</span>
            </Link>
          </DropdownMenuItem>
          {/* Futuramente podemos adicionar um link para configurações aqui */}
          {/* <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
   );
}
