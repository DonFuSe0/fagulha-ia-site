'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Repeat, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Generation = Database['public']['Tables']['generations']['Row'];

interface ImageActionsProps {
  generation: Generation;
}

export default function ImageActions({ generation }: ImageActionsProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Estado para a lógica de publicação
  const [isCurrentlyPublic, setIsCurrentlyPublic] = useState(generation.is_public);
  const [isPublishing, setIsPublishing] = useState(false);

  // Função para baixar a imagem
  const handleDownload = async () => {
    if (!generation.image_url) return;
    const toastId = toast.loading('Preparando download...');
    try {
      const response = await fetch(generation.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fagulha-ia-${generation.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado!', { id: toastId });
    } catch (error) {
      toast.error('Não foi possível baixar a imagem.', { id: toastId });
      console.error('Erro no download:', error);
    }
  };

  // Função para reutilizar as configurações
  const handleReuse = () => {
    const params = {
      modelId: generation.model_id,
      styleId: generation.style_id,
      prompt: generation.prompt,
      negativePrompt: generation.negative_prompt,
      resolution: generation.resolution,
      steps: generation.steps,
    };
    localStorage.setItem('reuseParams', JSON.stringify(params));
    router.push('/dashboard');
  };

  // Função para alternar o status de publicação (movida do PublishButton)
  const handleTogglePublish = async () => {
    setIsPublishing(true);
    const newStatus = !isCurrentlyPublic;
    
    const { error } = await supabase
      .from('generations')
      .update({ is_public: newStatus })
      .eq('id', generation.id);

    if (!error) {
      setIsCurrentlyPublic(newStatus);
      toast.success(newStatus ? 'Imagem agora é pública!' : 'Imagem agora é privada.');
    } else {
      toast.error('Ocorreu um erro. Tente novamente.');
      console.error("Erro ao atualizar status de publicação:", error.message);
    }
    setIsPublishing(false);
  };

  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-2">
      {/* Botão de Download */}
      <Button onClick={handleDownload} size="icon" variant="ghost" className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full">
        <Download size={16} />
      </Button>
      
      {/* Botão de Reutilizar */}
      <Button onClick={handleReuse} size="icon" variant="ghost" className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full">
        <Repeat size={16} />
      </Button>

      {/* Botão de Publicar/Privar com Ícone de Olho */}
      <Button onClick={handleTogglePublish} disabled={isPublishing} size="icon" variant="ghost" className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full">
        {isPublishing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isCurrentlyPublic ? (
          <Eye size={16} className="text-green-400" />
        ) : (
          <EyeOff size={16} className="text-gray-400" />
        )}
      </Button>
    </div>
  );
}
