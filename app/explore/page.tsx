'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchGenerations } from './actions';
import { Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';

type Generation = Awaited<ReturnType<typeof fetchGenerations>>[0];

export default function ExplorePage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const loadMoreGenerations = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const nextPage = page + 1;
    const newGenerations = await fetchGenerations(nextPage);
    
    if (newGenerations.length > 0) {
      setGenerations(prev => [...prev, ...newGenerations]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      const initialGenerations = await fetchGenerations(0);
      setGenerations(initialGenerations);
      if (initialGenerations.length === 0) {
        setHasMore(false);
      }
      setIsLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreGenerations();
    }
  }, [inView, hasMore, isLoading]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white">Explore as Criações da Comunidade</h1>
        <p className="text-lg text-gray-400 mt-2">Inspire-se com as imagens geradas por outros usuários.</p>
      </div>

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

      <div className="text-center mt-12 h-10">
        {hasMore ? (
          <div ref={ref} className="flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : generations.length > 0 ? (
          <p className="text-gray-500">Você chegou ao fim!</p>
        ) : (
          !isLoading && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-white">Nenhuma Imagem Pública Ainda</h2>
              <p className="text-gray-500 mt-2">Seja o primeiro a publicar! Gere uma imagem e a torne pública em sua galeria.</p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Link href="/dashboard">
                  Começar a Criar
                </Link>
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
