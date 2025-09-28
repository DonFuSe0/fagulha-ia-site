export const dynamic = 'force-dynamic';

import { supabaseServer } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

export default async function Explore() {
  const supabase = supabaseServer();
  const { data: gens, error } = await supabase
    .from('generations')
    .select('id, prompt, thumb_path, user_id, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    return <p className="text-danger">Erro ao carregar imagens públicas</p>;
  }
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Explorar</h1>
      {gens && gens.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gens.map((gen) => (
            <Link
              key={gen.id}
              href={`/explore?id=${gen.id}`}
              className="border border-border rounded-lg overflow-hidden"
            >
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
                <p className="truncate" title={gen.prompt}>{gen.prompt}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted">Nenhuma imagem pública por enquanto.</p>
      )}
    </div>
  );
}