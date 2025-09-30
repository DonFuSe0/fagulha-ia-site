import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/serverClient';

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { user } = session;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">Bem-vindo(a), {user.email}</h1>
      <p className="text-gray-300">
        Esta é sua área pessoal. No futuro, você poderá acompanhar suas
        gerações de imagens e gerenciar seus tokens aqui.
      </p>
    </div>
  );
}
