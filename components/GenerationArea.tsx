'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const supabase = createClient();

export default function GenerationArea() {
  const [prompt, setPrompt] = useState('um gato samurai meditando sob uma cerejeira, arte digital');
  const [negativePrompt, setNegativePrompt] = useState('texto, feio, deformado, múltiplas cabeças');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPromptId) return;

    const channel = supabase
      .channel(`generation-${currentPromptId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'generations',
          filter: `prompt_id=eq.${currentPromptId}`
        },
        (payload) => {
          const updatedGeneration = payload.new as { status: string; image_url: string };

          if (updatedGeneration.status === 'succeeded' && updatedGeneration.image_url) {
            toast.success('Sua imagem está pronta!');
            setGeneratedImage(updatedGeneration.image_url);
            setIsGenerating(false);
            setCurrentPromptId(null);
            channel.unsubscribe();
          } else if (updatedGeneration.status === 'failed') {
            toast.error('A geração da imagem falhou.');
            setIsGenerating(false);
            setCurrentPromptId(null);
            channel.unsubscribe();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentPromptId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setCurrentPromptId(null);

    const loadingToast = toast.loading('Enviando para a fila de geração...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, negativePrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao iniciar a geração');
      }
      
      toast.success('Sua ideia foi enviada! Aguardando a mágica acontecer.', { id: loadingToast });
      setCurrentPromptId(data.prompt_id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      toast.error(`Erro: ${errorMessage}`, { id: loadingToast });
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-surface/80 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div>
            <label htmlFor="prompt" className="block text-lg font-semibold text-white mb-2">
              ✨ Descreva sua ideia
            </label>
            <textarea
              id="prompt"
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full text-lg p-4 bg-background border-2 border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Ex: um gato samurai meditando sob uma cerejeira, arte digital"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label htmlFor="negative_prompt" className="block text-base font-medium text-text-secondary mb-2">
              O que evitar na imagem? (Opcional)
            </label>
            <textarea
              id="negative_prompt"
              rows={3}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full p-3 bg-background border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              placeholder="Ex: texto, feio, deformado, múltiplas cabeças"
              disabled={isGenerating}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full bg-gradient-to-r from-primary to-accent text-white text-xl font-bold py-4 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
          >
            {isGenerating ? 'Criando sua obra-prima...' : 'Gerar Imagem (3 Tokens)'}
          </button>
        </div>
        <div className="lg:col-span-2 flex items-center justify-center bg-background rounded-lg min-h-[300px] lg:min-h-full aspect-square border-2 border-dashed border-primary/20 overflow-hidden">
          {isGenerating && (
            <div className="text-center text-text-secondary animate-pulse">
              <p className="text-4xl mb-4">🌀</p>
              <p>Forjando pixels...</p>
            </div>
          )}
          {generatedImage && <img src={generatedImage} alt="Imagem gerada" className="rounded-md object-contain w-full h-full animate-fade-in" />}
          {!isGenerating && !generatedImage && (
            <div className="text-center text-gray-600">
              <p className="text-5xl mb-4">🖼️</p>
              <p>Sua arte aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
