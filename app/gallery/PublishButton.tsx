'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Globe, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PublishButtonProps {
  generationId: string;
  isPublic: boolean;
}

export default function PublishButton({ generationId, isPublic }: PublishButtonProps) {
  const [isCurrentlyPublic, setIsCurrentlyPublic] = useState(isPublic);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleTogglePublish = async () => {
    setLoading(true);
    const newStatus = !isCurrentlyPublic;

    const { error } = await supabase
      .from('generations')
      .update({ is_public: newStatus })
      .eq('id', generationId);

    if (!error) {
      setIsCurrentlyPublic(newStatus);
      // Se a página de explorar estiver aberta em outra aba, ela não verá a mudança
      // até ser recarregada. Isso é aceitável por agora.
    } else {
      // Lidar com o erro, talvez com um toast
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
      className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 border-none"
    >
      {isCurrentlyPublic ? (
        <Globe className="w-4 h-4 mr-2 text-green-400" />
      ) : (
        <Lock className="w-4 h-4 mr-2 text-gray-400" />
      )}
      <span className="text-white">{isCurrentlyPublic ? 'Público' : 'Privado'}</span>
    </Button>
  );
}
