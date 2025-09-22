'use client';

import { useState } from 'react';

export default function GenerationArea() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    // A lógica para chamar nossa API de geração virá aqui
    setIsGenerating(true);
    setGeneratedImage(null);
    console.log('Iniciando geração com o prompt:', prompt);
    
    // Simulação de uma geração de imagem
    setTimeout(() => {
      // No futuro, esta URL virá da resposta da API
      setGeneratedImage('https://placehold.co/1024x1024/9333ea/white?text=Sua+Imagem+Aparecerá+Aqui' );
      setIsGenerating(false);
    }, 5000); // Simula 5 segundos de geração
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Controles (Esquerda) */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Prompt (O que você quer criar?)
            </label>
            <textarea
              id="prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: um astronauta surfando em uma onda cósmica, estilo Van Gogh"
            />
          </div>
          <div>
            <label htmlFor="negative_prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Prompt Negativo (O que evitar?)
            </label>
            <textarea
              id="negative_prompt"
              rows={3}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: texto, marcas d'água, baixa qualidade"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Gerando...' : 'Gerar Imagem (3 Tokens)'}
          </button>
        </div>

        {/* Coluna de Visualização (Direita) */}
        <div className="flex items-center justify-center bg-gray-900 rounded-md min-h-[256px] lg:min-h-full">
          {isGenerating && <div className="text-gray-400">Carregando...</div>}
          {generatedImage && <img src={generatedImage} alt="Imagem gerada" className="rounded-md object-contain" />}
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
