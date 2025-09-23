import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Definindo o tipo de dado para cada geração, para segurança de tipo
type Generation = {
  id: string;
  image_url: string | null;
  prompt: string | null;
};

export default async function GalleryPage() {
  const supabase = createClient();

  // 1. Verificar se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login'); // Se não estiver logado, redireciona para a página de login
  }

  // 2. Buscar as gerações do usuário no banco de dados
  const { data: generations, error } = await supabase
    .from('generations')
    .select('id, image_url, prompt')
    .eq('user_id', user.id) // Apenas as gerações do usuário logado
    .eq('status', 'succeeded') // Apenas as que foram concluídas com sucesso
    .not('image_url', 'is', null) // Apenas as que têm uma URL de imagem
    .order('created_at', { ascending: false }); // As mais recentes primeiro

  if (error) {
    console.error('Erro ao buscar gerações:', error);
    // Poderíamos mostrar uma mensagem de erro aqui
  }

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Sua <span className="text-primary">Galeria Pessoal</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Todas as suas obras de arte geradas em um só lugar.
          </p>
        </div>

        {/* 3. Lógica de Exibição */}
        {generations && generations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {generations.map((gen: Generation) => (
              <div key={gen.id} className="group relative aspect-square bg-surface rounded-lg overflow-hidden border border-primary/10 shadow-lg transition-transform transform hover:scale-105 hover:shadow-primary/20">
                {gen.image_url && (
                  <Image
                    src={gen.image_url}
                    alt={gen.prompt || 'Imagem gerada por IA'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-opacity group-hover:opacity-50"
                  />
                )}
                {/* Overlay que aparece no hover */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-center text-sm line-clamp-4">
                    {gen.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 4. Mensagem para quando não há imagens
          <div className="text-center py-16 px-6 bg-surface rounded-lg border-2 border-dashed border-primary/20">
            <p className="text-5xl mb-4">🖼️</p>
            <h2 className="text-2xl font-semibold text-white">Sua galeria está vazia</h2>
            <p className="mt-2 text-text-secondary">
              Parece que você ainda não criou nenhuma imagem.
            </p>
            <Link href="/dashboard" className="mt-6 inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-transform transform hover:scale-105">
              Começar a Criar Agora
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
