import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PublishButton from './PublishButton';
import { Button } from '@/components/ui/button';
import { Clock, Loader2 } from 'lucide-react';
import ImageActions from './ImageActions'; // Importando o novo componente de ações

// Função auxiliar para calcular a diferença de dias
function getDaysRemaining(expiresAt: string): number {
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const differenceInMs = expirationDate.getTime() - now.getTime();
  return Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
}

export default async function GalleryPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data: generations, error } = await supabase
    .from('generations')
    .select('*, expires_at')
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
          {generations.map((gen) => {
            const daysLeft = getDaysRemaining(gen.expires_at);
            return (
              <div key={gen.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                {gen.status === 'succeeded' && gen.image_url ? (
                  <>
                    <Image
                      src={gen.image_url}
                      alt={gen.prompt || 'Imagem gerada por IA'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    <div className={`absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold py-1 px-2 rounded-full ${daysLeft <= 7 ? 'text-red-400' : 'text-yellow-400'}`}>
                      <Clock size={14} />
                      <span>Expira em {daysLeft}d</span>
                    </div>

                    <PublishButton generationId={gen.id} isPublic={gen.is_public} />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      {/* Componente de Ações adicionado aqui */}
                      <ImageActions generation={gen} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    {gen.status === 'processing' ? (
                      <>
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
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
            );
          })}
        </div>
      ) : (
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
