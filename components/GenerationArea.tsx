'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function GenerationArea() {
  const [prompt, setPrompt] = useState('um astronauta surfando em uma onda cósmica, estilo Van Gogh');
  const [negativePrompt, setNegativePrompt] = useState('texto, marcas d\'água, baixa qualidade');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

  useEffect(() => {
    // Se não estivermos esperando por uma imagem, não faz nada.
    if (!currentPromptId) return;

    console.log(`Ouvindo atualizações para o prompt_id: ${currentPromptId}`);

    // Cria uma inscrição (subscription) no canal de tempo real do Supabase
    const channel = supabase
      .channel(`generation-${currentPromptId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'generations',
          filter: `prompt_id=eq.${currentPromptId}` // Só nos notifique sobre a nossa geração atual
        },
        (payload) => {
          console.log('Recebemos uma atualização!', payload);
          const updatedGeneration = payload.new as { status: string; image_url: string };

          if (updatedGeneration.status === 'succeeded' && updatedGeneration.image_url) {
            setGeneratedImage(updatedGeneration.image_url);
            setIsGenerating(false);
            setCurrentPromptId(null);
            channel.unsubscribe(); // Para de ouvir após receber a imagem
          } else if (updatedGeneration.status === 'failed') {
            setError('A geração da imagem falhou.');
            setIsGenerating(false);
            setCurrentPromptId(null);
            channel.unsubscribe();
          }
        }
      )
      .subscribe();

    // Função de limpeza para remover a inscrição quando o componente for desmontado
    return () => {
      channel.unsubscribe();
    };
  }, [currentPromptId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentPromptId(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, negativePrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao iniciar a geração');
      }

      const data = await response.json();
      console.log('Geração iniciada com sucesso. ID do Prompt:', data.prompt_id);
      setCurrentPromptId(data.prompt_id); // Armazena o ID da geração que estamos esperando

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      console.error(errorMessage);
      setError(`Erro: ${errorMessage}`);
      setIsGenerating(false);
    }
  };

  // ... (o JSX do return permanece o mesmo)
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      {/* ... */}
    </div>
  );
}
