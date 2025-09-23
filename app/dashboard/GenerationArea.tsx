'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // Importando o toast para feedback

type Model = Database['public']['Tables']['models']['Row'];
type Style = Database['public']['Tables']['styles']['Row'];

export default function GenerationArea() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  
  const [models, setModels] = useState<Model[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('none');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [resolution, setResolution] = useState('1024x1024');
  const [steps, setSteps] = useState(25);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const { data: modelsData, error: modelsError } = await supabase.from('models').select('*').eq('is_active', true);
      if (modelsError) {
        toast.error('Erro ao carregar os modelos de IA.');
        return;
      }

      const { data: stylesData, error: stylesError } = await supabase.from('styles').select('*').eq('is_active', true);
      if (stylesError) {
        toast.error('Erro ao carregar os estilos.');
        return;
      }

      if (modelsData) {
        setModels(modelsData);
        if (modelsData.length > 0) {
          setSelectedModelId(modelsData[0].id);
        }
      }
      if (stylesData) setStyles(stylesData);
    };
    fetchOptions();
  }, [supabase]);

  const tokenCost = useMemo(() => {
    if (resolution === '512x512') return 1;
    if (resolution === '768x768') return 2;
    if (resolution === '1024x1024') return 3;
    return 3;
  }, [resolution]);

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Por favor, insira um prompt para gerar a imagem.');
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Enviando para a fila de geração...');

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: selectedModelId,
        styleId: selectedStyleId,
        prompt,
        negativePrompt,
        resolution,
        steps,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error || 'Ocorreu um erro ao gerar a imagem.', { id: toastId });
    } else {
      toast.success('Imagem enfileirada com sucesso! Verifique sua galeria em breve.', { id: toastId });
      router.refresh(); // Atualiza o saldo de tokens no Header
    }
    setLoading(false);
  };

  const renderFormContent = () => (
    <>
      <div><Label>Modelo</Label><Select value={selectedModelId} onValueChange={setSelectedModelId}><SelectTrigger><SelectValue placeholder="Selecione um modelo..." /></SelectTrigger><SelectContent>{models.map(model => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Estilo</Label><Select value={selectedStyleId} onValueChange={setSelectedStyleId}><SelectTrigger><SelectValue placeholder="Selecione um estilo..." /></SelectTrigger><SelectContent><SelectItem value="none">Nenhum</SelectItem>{styles.map(style => <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label htmlFor="prompt">Prompt</Label><Textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Um astronauta roxo em um cavalo branco, fotorrealista..." rows={3} /></div>
      <div><Label htmlFor="negative-prompt">Prompt Negativo</Label><Textarea id="negative-prompt" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="desenho, má qualidade, deformado, cartoon..." rows={2} /></div>
    </>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="basic">Básico</TabsTrigger><TabsTrigger value="advanced">Avançado</TabsTrigger></TabsList>
        <TabsContent value="basic" className="space-y-4 pt-4">
          {renderFormContent()}
          <div><Label>Resolução</Label><Select value={resolution} onValueChange={setResolution}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="512x512">512 x 512 (Rápido - 1 token)</SelectItem><SelectItem value="768x768">768 x 768 (Médio - 2 tokens)</SelectItem><SelectItem value="1024x1024">1024 x 1024 (HD - 3 tokens)</SelectItem></SelectContent></Select></div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4 pt-4">
          {renderFormContent()}
          <div><Label>Resolução</Label><Select value={resolution} onValueChange={setResolution}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="512x512">512x512</SelectItem><SelectItem value="768x768">768x768</SelectItem><SelectItem value="1024x1024">1024x1024</SelectItem></SelectContent></Select></div>
          <div className="pt-2"><Label>Passos de Refinamento (Steps): {steps}</Label><Slider defaultValue={[25]} value={[steps]} min={15} max={50} step={1} onValueChange={vals => setSteps(vals[0])} /><p className="text-xs text-gray-400">Valores mais altos podem melhorar a qualidade, mas demoram mais.</p></div>
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <Button onClick={handleGenerate} disabled={loading || !selectedModelId} className="w-full font-bold text-lg py-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600">
          {loading ? 'Gerando...' : `Gerar Imagem (Custo: ${tokenCost} Token${tokenCost > 1 ? 's' : ''})`}
        </Button>
      </div>
    </div>
  );
}
