import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PublishButton from './PublishButton'; // Importando o novo componente que criamos

export default async function GalleryPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // A proteção de rota já existe no layout, mas mantemos como dupla garantia.
  if (!session) {
    redirect('/login');
  }

  // A busca de dados original, que está correta.
  const { data: generations, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-center text-red-500 mt-10">Erro ao carregar sua galeria. Tente novamente mais tarde.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white">Minha Galeria</h1>
        <p className="text-lg text-gray-400 mt-2">Todas as suas criações em um só lugar.</p>
      </div>

      {generations && generations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {generations.map((gen) => (
            <div key={gen.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
              {gen.status === 'succeeded' && gen.image_url ? (
                // Bloco para imagens concluídas (com sucesso)
                <>
                  <Image
                    src={gen.image_url}
                    alt={gen.prompt || 'Imagem gerada por IA'}
                    fill // Usar 'fill' para preencher o container 'aspect-square'
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {/* INTEGRAÇÃO DO BOTÃO: Adicionado aqui, dentro do container da imagem */}
                  <PublishButton generationId={gen.id} isPublic={gen.is_public} />
                  
                  {/* Overlay com o prompt que aparece no hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm line-clamp-3">{gen.prompt}</p>
                  </div>
                </>
              ) : (
                // Bloco para imagens em processamento ou que falharam
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                  {gen.status === 'processing' ? (
                    <>
                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-white font-semibold">Processando...</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-400 font-semibold mb-2">Falhou</p>
                      <p className="text-xs text-gray-400 line-clamp-3">{gen.prompt}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Bloco para quando o usuário ainda não tem imagens
        <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
          <h2 className="text-2xl font-bold text-white">Sua Galeria está Vazia</h2>
          <p className="text-gray-500 mt-2">Parece que você ainda não criou nenhuma imagem.</p>
          <Button asChild className="mt-6 bg-purple-600 hover:bg-purple-700">
            <Link href="/dashboard">
              Começar a Criar Agora
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
