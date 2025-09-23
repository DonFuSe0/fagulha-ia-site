import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('token_balance')
    .eq('id', user.id)
    .single();

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Seu <span className="text-primary">Perfil</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Gerencie suas informações e configurações.
        </p>
      </div>

      <div className="bg-surface p-8 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20">
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar do usuário" width={128} height={128} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-background flex items-center justify-center text-primary font-bold text-5xl">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">{user.email}</h2>
            <p className="text-text-secondary">Usuário do Fagulha.ia</p>
            <div className="mt-4 flex items-center justify-center sm:justify-start space-x-2 bg-background px-4 py-2 rounded-full border border-primary/20 w-fit mx-auto sm:mx-0">
              <span className="text-yellow-400 text-lg">⚡</span>
              <span className="font-bold text-white text-lg">{profile?.token_balance ?? 0}</span>
              <span className="text-text-secondary text-sm">tokens restantes</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
