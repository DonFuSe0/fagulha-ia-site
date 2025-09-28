export const dynamic = 'force-dynamic';

import { supabaseServer } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const supabase = supabaseServer();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return <p>Você precisa estar logado para acessar seu perfil.</p>;
  }
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  if (error || !profile) {
    return <p className="text-danger">Erro ao carregar perfil: {error?.message}</p>;
  }
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Perfil</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}