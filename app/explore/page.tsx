import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import Image from 'next/image';
import Link from 'next/link';

// Esta página é renderizada no servidor e busca as imagens públicas.
export default async function ExplorePage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: generations, error } = await supabase
    .from('generations')
    .select('id, image_url, prompt')
    .eq('status', 'succeeded') // Apenas imagens concluídas
    .eq('is_public', true)     // Apenas imagens marcadas como públicas
    .order('created_at', { ascending: false }) // As mais recentes primeiro
    .limit(50); // Limita a 50 imagens para começar, podemos adicionar paginação depois

  if (error) {
    return <p className="text-center text-red-500">Erro ao carregar as imagens.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white">Explore as Criações da Comunidade</h1>
        <p className="text-lg text-gray-400 mt-2">Inspire-se com as imagens geradas por outros usuários.</p>
      </div>

      {generations && generations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {generations.map((gen) => (
            <div key={gen.id} className="group relative rounded-lg overflow-hidden">
              <Image
                src={gen.image_url!}
                alt={gen.prompt || 'Imagem gerada por IA'}
                width={512}
                height={512}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm line-clamp-3">{gen.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-white">Nenhuma Imagem Pública Ainda</h2>
          <p className="text-gray-500 mt-2">Seja o primeiro a publicar! Gere uma imagem e a torne pública em sua galeria.</p>
          <Link href="/dashboard" className="mt-4 inline-block bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">
            Começar a Criar
          </Link>
        </div>
      )}
    </div>
  );
}
