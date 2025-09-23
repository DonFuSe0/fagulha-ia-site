'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

type Model = Database['public']['Tables']['models']['Row'];
type Style = Database['public']['Tables']['styles']['Row'];

// Componente interno para lidar com a lógica que depende de useSearchParams
function GenerationAreaContent() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook para ler parâmetros da URL
  
  const [models, setModels] = useState<Model[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('none');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [resolution, setResolution] = useState('1024x1024');
  const [steps, setSteps] = useState(25);
  
  const [loading, setLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const { data: modelsData } = await supabase.from('models').select('*').eq('is_active', true);
      const { data: stylesData } = await supabase.from('styles').select('*').eq('is_active', true);

      if (modelsData) setModels(modelsData);
      if (stylesData) setStyles(stylesData);
      setOptionsLoaded(true);
    };
    fetchOptions();
  }, [supabase]);

  useEffect(() => {
    if (!optionsLoaded) return;

    // *** A MUDANÇA ESTÁ AQUI ***
    const modelIdParam = searchParams.get('modelId');
    const styleIdParam = searchParams.get('styleId');
    const promptParam = searchParams.get('prompt');
    const negativePromptParam = searchParams.get('negativePrompt');
    const resolutionParam = searchParams.get('resolution');
    const stepsParam = searchParams.get('steps');

    if (modelIdParam || styleIdParam || promptParam) {
      if (modelIdParam && models.some(m => m.id === modelIdParam)) setSelectedModelId(modelIdParam);
      if (styleIdParam && styles.some(s => s.id === styleIdParam)) setSelectedStyleId(styleIdParam);
      if (promptParam) setPrompt(promptParam);
      if (negativePromptParam) setNegativePrompt(negativePromptParam);
      if (resolutionParam) setResolution(resolutionParam);
      if (stepsParam) setSteps(Number(stepsParam));
      
      toast.success('Configurações da imagem anterior carregadas!');
      // Limpa a URL para não recarregar os parâmetros ao atualizar a página
      router.replace('/dashboard', { scroll: false });
    } else if (models.length > 0 && !selectedModelId) {
      // Define o modelo padrão se nenhum parâmetro de reutilização for encontrado
      setSelectedModelId(models[0].id);
    }

  }, [optionsLoaded, models, styles, searchParams, router, selectedModelId]);

  const tokenCost = useMemo(() => {
    if (resolution === '512x512') return 1;
    if (resolution === '768x768') return 2;
    if (resolution === '1024x1024') return 3;
    return 3;
  }, [resolution]);

  const handleGenerate = async () => {
    // ... (lógica de handleGenerate inalterada)
  };

  const renderFormContent = () => (
    // ... (JSX de renderFormContent inalterado)
  );

  return (
    // ... (JSX de retorno principal inalterado)
  );
}

// Componente wrapper para usar Suspense, que é necessário para useSearchParams
export default function GenerationArea() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <GenerationAreaContent />
    </Suspense>
  );
}
