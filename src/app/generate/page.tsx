export const dynamic = 'force-dynamic';

import GenerateForm from '@/components/generator/GenerateForm';
import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function GeneratePage() {
  const supabase = supabaseServer();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return (
      <div className="text-center">
        <p className="mb-4">Você precisa estar logado para gerar imagens.</p>
        <Link href="/auth/login" className="btn-primary">Entrar</Link>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gerar imagem</h1>
      <GenerateForm />
    </div>
  );
}