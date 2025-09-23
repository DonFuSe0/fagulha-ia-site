import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import UserMenu from './UserMenu';
import { Database } from '@/lib/database.types';
import { Button } from './ui/button'; // Importando o componente de botão para consistência

export default async function Header() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userProfile = null;
  if (session) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('token_balance, avatar_url, username')
      .eq('id', session.user.id)
      .single();
    userProfile = profileData;
  }

  return (
    <header className="w-full max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
      {/* Logo */}
      <Link href={session ? '/dashboard' : '/'} className="text-2xl font-bold text-white">
        Fagulha<span className="text-purple-500">.ia</span>
      </Link>

      {/* Conteúdo da Direita */}
      <div className="flex items-center gap-4">
        {session && userProfile ? (
          // Se o usuário está LOGADO, mostra o menu dele
          <UserMenu
            user={session.user}
            profile={userProfile}
          />
        ) : (
          // Se o usuário está DESLOGADO, mostra os links públicos e o botão de login
          <>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/#explore" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Explorar
              </Link>
              <Link href="/#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Planos
              </Link>
              <Link href="/#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Como Funciona
              </Link>
            </nav>
            <div className="h-6 w-px bg-gray-700 hidden md:block"></div> {/* Divisor visual */}
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
              <Link href="/login">
                Começar a Criar
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
