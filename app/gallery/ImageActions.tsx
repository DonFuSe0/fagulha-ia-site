'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Repeat } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';

type Generation = Database['public']['Tables']['generations']['Row'];

interface ImageActionsProps {
  generation: Generation;
}

export default function ImageActions({ generation }: ImageActionsProps) {
  const router = useRouter();

  // Função para baixar a imagem
  const handleDownload = async () => {
    if (!generation.image_url) return;
    try {
      const response = await fetch(generation.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fagulha-ia-${generation.id}.png`; // Nome do arquivo
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado!');
    } catch (error) {
      toast.error('Não foi possível baixar a imagem.');
      console.error('Erro no download:', error);
    }
  };

  // Função para reutilizar as configurações
  const handleReuse = () => {
    // Usamos o localStorage para passar os dados para a outra página.
    // É uma forma simples de comunicação entre páginas no lado do cliente.
    const params = {
      modelId: generation.model_id,
      styleId: generation.style_id,
      prompt: generation.prompt, // Idealmente, deveríamos ter o prompt original antes do estilo
      negativePrompt: generation.negative_prompt,
      resolution: generation.resolution,
      steps: generation.steps,
    };
    localStorage.setItem('reuseParams', JSON.stringify(params));
    router.push('/dashboard');
  };

  return (
    <div className="absolute bottom-2 left-2 flex items-center gap-2">
      <Button onClick={handleDownload} size="icon" variant="ghost" className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full">
        <Download size={16} />
      </Button>
      <Button onClick={handleReuse} size="icon" variant="ghost" className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full">
        <Repeat size={16} />
      </Button>
    </div>
  );
}
