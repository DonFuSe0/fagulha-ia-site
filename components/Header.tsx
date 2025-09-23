import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import UserMenu from './UserMenu'; // O componente que mostra o avatar e o menu
import { Database } from '@/lib/database.types'; // Importe seus tipos de DB

export default async function Header() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let userProfile = null;
  if (session) {
    // Se o usuário está logado, buscamos o perfil dele diretamente do banco de dados.
    // Isso garante que o saldo de tokens esteja sempre atualizado.
    const { data: profileData } = await supabase
      .from('profiles')
      .select('token_balance, avatar_url')
      .eq('id', session.user.id)
      .single();
    userProfile = profileData;
  }

  return (
    <header className="w-full max-w-6xl mx-auto py-4 px-6 flex justify-between items-center">
      <Link href={session ? '/dashboard' : '/'} className="text-2xl font-bold text-white">
        Fagulha<span className="text-purple-500">.ia</span>
      </Link>
      <nav>
        {session && userProfile ? (
          // Passamos os dados atualizados para o componente do menu
          <UserMenu
            user={session.user}
            profile={{
              token_balance: userProfile.token_balance,
              avatar_url: userProfile.avatar_url,
            }}
          />
        ) : (
          // Se não há sessão, mostramos o botão de Login
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Login / Cadastrar
          </Link>
        )}
      </nav>
    </header>
  );
}
