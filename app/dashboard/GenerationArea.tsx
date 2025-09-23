'use client';

// ... (imports inalterados)

export default function GenerationArea() {
  // ... (todos os 'useState' inalterados)

  useEffect(() => {
    // ... (lógica de fetchOptions inalterada)
  }, [supabase]);

  // *** NOVO useEffect PARA A FUNÇÃO "REUTILIZAR" ***
  useEffect(() => {
    const reuseParams = localStorage.getItem('reuseParams');
    if (reuseParams) {
      try {
        const params = JSON.parse(reuseParams);
        // Preenche o estado do formulário com os parâmetros salvos
        if (params.modelId) setSelectedModelId(params.modelId);
        if (params.styleId) setSelectedStyleId(params.styleId);
        if (params.prompt) setPrompt(params.prompt);
        if (params.negativePrompt) setNegativePrompt(params.negativePrompt);
        if (params.resolution) setResolution(params.resolution);
        if (params.steps) setSteps(params.steps);
        
        toast.success('Configurações da imagem anterior carregadas!');
      } catch (e) {
        console.error('Erro ao carregar parâmetros de reutilização:', e);
      } finally {
        // Limpa os parâmetros para não serem reutilizados novamente ao recarregar a página
        localStorage.removeItem('reuseParams');
      }
    }
  }, []);

  // ... (resto do componente: tokenCost, handleGenerate, renderFormContent, e o JSX de retorno inalterados)
}
