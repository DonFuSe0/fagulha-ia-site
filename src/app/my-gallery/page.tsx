export const dynamic = 'force-dynamic';

import { supabaseServer } from '@/lib/supabase/server';
import Image from 'next/image';

export default async function MyGallery() {
  const supabase = supabaseServer();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return <p>Você precisa estar logado para ver sua galeria.</p>;
  }
  const { data: gens, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  if (error) {
    return <p className="text-danger">Erro ao carregar galeria: {error.message}</p>;
  }
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Minha galeria</h1>
      {gens && gens.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gens.map((gen) => (
            <div key={gen.id} className="border border-border rounded-lg overflow-hidden">
              {gen.thumb_path ? (
                <Image
                  src={gen.thumb_path}
                  alt={gen.prompt}
                  width={300}
                  height={300}
                  className="object-cover w-full h-48"
                />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center text-sm">
                  sem miniatura
                </div>
              )}
              <div className="p-2 text-sm">
                <p className="font-semibold truncate">{gen.prompt}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted">{new Date(gen.created_at).toLocaleDateString()}</span>
                  <span className="text-xs {gen.status === 'completed' ? 'text-success' : gen.status === 'failed' ? 'text-danger' : 'text-muted'}">
                    {gen.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">Você ainda não gerou nenhuma imagem.</p>
      )}
    </div>
  );
}