export const dynamic = 'force-dynamic';

import GenerateForm from '@/components/generator/GenerateForm';
import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function GeneratePage() {
  const supabase = supabaseServer();
  // Use getUser instead of getSession to ensure that the token is
  // revalidated on the server.  This also prevents issues where a
  // stale or path‑scoped cookie would otherwise cause getSession to
  // return null.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
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
