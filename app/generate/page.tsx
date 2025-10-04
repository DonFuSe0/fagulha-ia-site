export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/serverClient';

/**
 * Página de geração. Nesta primeira versão é apenas um placeholder para a
 * funcionalidade de geração de imagens. Apenas usuários autenticados
 * conseguem acessar.
 */
export default async function GeneratePage() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/login');
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">Gerar Imagem</h1>
      <p className="text-gray-300">
        Aqui futuramente você poderá gerar imagens com IA. Por enquanto,
        esta página é um espaço reservado para o recurso de geração.
      </p>
    </div>
  );
}