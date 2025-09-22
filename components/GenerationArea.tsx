'use client';

import { useState } from 'react';

export default function GenerationArea() {
  const [prompt, setPrompt] = useState('um astronauta surfando em uma onda cósmica, estilo Van Gogh');
  const [negativePrompt, setNegativePrompt] = useState('texto, marcas d\'água, baixa qualidade');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

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
      // Aqui, no futuro, vamos "ouvir" o webhook para receber a imagem final.
      // Por enquanto, a imagem não aparecerá, pois a API do ComfyUI é assíncrona.
      // O spinner de "Gerando..." ficará ativo.

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      console.error(errorMessage);
      setError(`Erro: ${errorMessage}`);
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Controles (Esquerda) */}
        <div className="lg:col-span-2 space-y-4">
          {/* ... (campos de prompt e negative prompt permanecem os mesmos) ... */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Prompt (O que você quer criar?)
            </label>
            <textarea id="prompt" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label htmlFor="negative_prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Prompt Negativo (O que evitar?)
            </label>
            <textarea id="negative_prompt" rows={3} value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Gerando...' : 'Gerar Imagem (3 Tokens)'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Coluna de Visualização (Direita) */}
        <div className="flex items-center justify-center bg-gray-900 rounded-md min-h-[256px] lg:min-h-full aspect-square">
          {isGenerating && <div className="text-gray-400 animate-pulse">Gerando imagem...</div>}
          {generatedImage && <img src={generatedImage} alt="Imagem gerada" className="rounded-md object-contain w-full h-full" />}
          {!isGenerating && !generatedImage && (
            <div className="text-center text-gray-500">
              <p>Sua imagem aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
