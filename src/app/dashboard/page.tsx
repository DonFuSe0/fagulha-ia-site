export const dynamic = 'force-dynamic';

import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

export default async function Dashboard() {
  const supabase = supabaseServer();
  // Fetch balance via RPC
  const { data: balanceData, error: balanceError } = await supabase.rpc('get_my_balance');
  const balance = balanceData ?? 0;
  // Fetch last 5 generations
  const { data: gens, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/generate" className="btn-primary">Nova geração</Link>
      </div>
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Saldo de tokens</h2>
        {balanceError ? (
          <p className="text-danger">Erro ao carregar saldo</p>
        ) : (
          <p className="text-3xl font-bold text-primary">{balance}</p>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Últimas gerações</h2>
        {error && <p className="text-danger">Erro ao carregar gerações</p>}
        {gens && gens.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {gens.map((gen) => (
              <Link
                key={gen.id}
                href={`/my-gallery?id=${gen.id}`}
                className="block border border-border rounded-lg overflow-hidden"
              >
                {gen.thumb_path ? (
                  <Image
                    src={gen.thumb_path}
                    alt={gen.prompt}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-[200px] bg-muted flex items-center justify-center text-sm">
                    sem miniatura
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted">Nenhuma geração ainda.  Clique em “Nova geração” para começar.</p>
        )}
      </div>
    </div>
  );
}