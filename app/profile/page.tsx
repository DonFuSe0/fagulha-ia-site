import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form'; // Criaremos este componente a seguir

// Esta é a página de Perfil. Ela busca os dados do usuário no servidor.
export default async function ProfilePage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se o usuário não estiver logado, ele será redirecionado pelo layout (dashboard),
  // mas esta é uma dupla garantia.
  if (!session) {
    redirect('/login');
  }

  // Busca os dados do perfil na tabela 'profiles'.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    // Isso pode acontecer se o gatilho falhou em criar o perfil.
    // Podemos mostrar uma mensagem de erro ou redirecionar.
    return <div className="text-white text-center p-8">Erro ao carregar o perfil.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
      {/* Passamos os dados do perfil para um componente de formulário do lado do cliente */}
      <ProfileForm profile={profile} user={session.user} />
    </div>
  );
}
