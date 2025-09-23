'use client'; // 1. Transformar em Componente Cliente

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchGenerations } from './actions'; // 2. Importar a Server Action
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Definindo o tipo para as gerações, para segurança de tipo.
type Generation = Awaited<ReturnType<typeof fetchGenerations>>[0];

export default function ExplorePage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // 3. Efeito para carregar as imagens iniciais
  useEffect(() => {
    const loadInitialGenerations = async () => {
      setIsLoading(true);
      const initialGenerations = await fetchGenerations(0);
      setGenerations(initialGenerations);
      if (initialGenerations.length === 0) {
        setHasMore(false);
      }
      setIsLoading(false);
    };
    loadInitialGenerations();
  }, []);

  // 4. Função para carregar mais imagens
  const loadMoreGenerations = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    const newGenerations = await fetchGenerations(nextPage);
    
    if (newGenerations.length > 0) {
      setGenerations(prev => [...prev, ...newGenerations]);
      setPage(nextPage);
    } else {
      setHasMore(false); // Não há mais imagens para carregar
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white">Explore as Criações da Comunidade</h1>
        <p className="text-lg text-gray-400 mt-2">Inspire-se com as imagens geradas por outros usuários.</p>
      </div>

      {/* Galeria de Imagens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {generations.map((gen) => (
          <div key={gen.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900">
            <Image
              src={gen.image_url!}
              alt={gen.prompt || 'Imagem gerada por IA'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white text-sm line-clamp-3">{gen.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Botão "Carregar Mais" e Indicador de Loading */}
      <div className="text-center mt-12">
        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}
        {!isLoading && hasMore && generations.length > 0 && (
          <Button onClick={loadMoreGenerations} variant="outline" className="bg-gray-800 hover:bg-gray-700 border-gray-600">
            Carregar Mais
          </Button>
        )}
        {!hasMore && generations.length > 0 && (
          <p className="text-gray-500">Você chegou ao fim!</p>
        )}
        {!isLoading && generations.length === 0 && (
           <div className="text-center py-16">
             <h2 className="text-2xl font-bold text-white">Nenhuma Imagem Pública Ainda</h2>
             <p className="text-gray-500 mt-2">Seja o primeiro a publicar! Gere uma imagem e a torne pública em sua galeria.</p>
             <Link href="/dashboard" className="mt-4 inline-block bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">
               Começar a Criar
             </Link>
           </div>
        )}
      </div>
    </div>
  );
}
