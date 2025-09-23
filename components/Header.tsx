import { createClient } from '@/lib/supabase/server';
import UserMenu from './UserMenu';

export default async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let tokenBalance = 0;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('token_balance').eq('id', user.id).single();
    if (profile) tokenBalance = profile.token_balance;
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/dashboard" className="text-3xl font-bold text-white">
            <span className="text-primary">Fagulha</span>.ia
          </a>
          
          {user && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-background px-4 py-2 rounded-full border border-primary/20">
                <span className="text-yellow-400 text-lg">⚡</span>
                <span className="font-bold text-white text-lg">{tokenBalance}</span>
                <span className="text-text-secondary text-sm">tokens</span>
              </div>
              <UserMenu user={user} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
