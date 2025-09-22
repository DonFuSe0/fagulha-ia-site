import { createClient } from '@/lib/supabase/server';
import UserMenu from './UserMenu';

export default async function Header() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let tokenBalance = 0;
  if (user) {
    // Busca o perfil do usuário para obter o saldo de tokens
    const { data: profile } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      tokenBalance = profile.token_balance;
    }
  }

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/dashboard" className="text-2xl font-bold text-purple-400">
            Fagulha.ia
          </a>
          
          {user && ( // Mostra esses elementos apenas se o usuário estiver logado
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1.5 rounded-full">
                <span className="text-yellow-400">⚡</span>
                <span className="font-semibold text-white">{tokenBalance}</span>
                <span className="text-gray-400 text-sm">tokens</span>
              </div>
              <UserMenu user={user} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
