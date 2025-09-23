'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // 1. Importar a função toast

interface PublishButtonProps {
  generationId: string;
  isPublic: boolean;
}

export default function PublishButton({ generationId, isPublic }: PublishButtonProps) {
  const [isCurrentlyPublic, setIsCurrentlyPublic] = useState(isPublic);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleTogglePublish = async () => {
    setLoading(true);
    const newStatus = !isCurrentlyPublic;
    const toastId = toast.loading(newStatus ? 'Publicando imagem...' : 'Tornando imagem privada...'); // 2. Iniciar toast de loading

    const { error } = await supabase
      .from('generations')
      .update({ is_public: newStatus })
      .eq('id', generationId);

    if (!error) {
      setIsCurrentlyPublic(newStatus);
      // 3. Atualizar o toast com sucesso
      toast.success(newStatus ? 'Imagem publicada na galeria Explorar!' : 'Imagem agora é privada.', { id: toastId });
    } else {
      // 4. Atualizar o toast com erro
      toast.error('Ocorreu um erro. Tente novamente.', { id: toastId });
      console.error("Erro ao atualizar status de publicação:", error.message);
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleTogglePublish}
      disabled={loading}
      variant="outline"
      size="sm"
      className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 border-none text-white h-8 px-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isCurrentlyPublic ? (
        <>
          <Globe className="w-4 h-4 mr-1.5 text-green-400" />
          <span>Público</span>
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 mr-1.5 text-gray-400" />
          <span>Privado</span>
        </>
      )}
    </Button>
  );
}
