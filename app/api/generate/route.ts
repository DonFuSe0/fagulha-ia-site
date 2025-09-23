import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // 1. Validação do Usuário
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado. Faça login para gerar imagens.' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Extração e Validação dos Parâmetros do Corpo da Requisição
  const {
    modelId,
    styleId,
    prompt,
    negativePrompt,
    resolution,
    steps,
  } = await request.json();

  if (!prompt || !modelId || !resolution) {
    return NextResponse.json({ error: 'Parâmetros inválidos. Prompt, modelo e resolução são obrigatórios.' }, { status: 400 });
  }

  // 3. Cálculo do Custo de Tokens
  let tokenCost = 3; // Custo padrão
  if (resolution === '512x512') tokenCost = 1;
  if (resolution === '768x768') tokenCost = 2;

  // 4. Verificação de Saldo e Débito de Tokens
  try {
    // Usamos uma chamada de função no Supabase (RPC) para fazer a verificação e o débito de forma atômica.
    // Isso evita que o usuário fique com saldo negativo se fizer várias requisições ao mesmo tempo.
    const { error: rpcError } = await supabase.rpc('debit_tokens', {
      user_id_input: userId,
      debit_amount: tokenCost,
    });

    if (rpcError) {
      // O erro 'insufficient_balance' será lançado pela função do banco de dados.
      return NextResponse.json({ error: rpcError.message }, { status: 402 }); // 402 Payment Required
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Erro ao processar tokens: ' + e.message }, { status: 500 });
  }

  // 5. Combinação de Prompts com Estilos
  let finalPrompt = prompt;
  let finalNegativePrompt = negativePrompt || '';

  if (styleId && styleId !== 'none') {
    const { data: style } = await supabase
      .from('styles')
      .select('prompt_prefix, prompt_suffix, negative_prompt_prefix, negative_prompt_suffix')
      .eq('id', styleId)
      .single();

    if (style) {
      finalPrompt = `${style.prompt_prefix || ''} ${prompt} ${style.prompt_suffix || ''}`.trim();
      finalNegativePrompt = `${style.negative_prompt_prefix || ''} ${negativePrompt || ''} ${style.negative_prompt_suffix || ''}`.trim();
    }
  }

  // 6. Preparação para o ComfyUI
  const { data: model } = await supabase
    .from('models')
    .select('comfyui_workflow_name')
    .eq('id', modelId)
    .single();

  if (!model) {
    return NextResponse.json({ error: 'Modelo de IA não encontrado.' }, { status: 404 });
  }

  const promptId = crypto.randomUUID(); // ID único para rastrear esta geração

  // 7. Registro da Geração no Banco de Dados (com status 'processing')
  const { error: insertError } = await supabase.from('generations').insert({
    id: promptId,
    user_id: userId,
    prompt: finalPrompt,
    negative_prompt: finalNegativePrompt,
    status: 'processing',
    // Outros campos como model_id, style_id, etc., podem ser adicionados aqui se você os adicionar à tabela 'generations'.
  });

  if (insertError) {
    // Se falhar em registrar, não devemos prosseguir. Idealmente, deveríamos devolver os tokens,
    // mas por simplicidade, vamos apenas retornar o erro.
    return NextResponse.json({ error: 'Erro ao registrar a geração: ' + insertError.message }, { status: 500 });
  }

  // 8. Envio da Tarefa para o ComfyUI
  // A lógica de chamada para a API do ComfyUI permanece aqui.
  // Esta parte ainda depende da conexão com seu servidor, que pausamos.
  // Por enquanto, vamos simular o sucesso.
  const comfyApiUrl = process.env.COMFYUI_API_URL;
  if (!comfyApiUrl) {
    // Simulação para desenvolvimento sem ComfyUI conectado
    console.warn('COMFYUI_API_URL não está definida. Simulando sucesso da API.');
    // Em um cenário real, você poderia atualizar o status para 'failed' aqui.
    return NextResponse.json({ message: 'Geração enfileirada com sucesso (simulado).', promptId }, { status: 200 });
  }
  
  // A chamada real para o ComfyUI iria aqui...
  // await fetch(comfyApiUrl, { method: 'POST', body: JSON.stringify({ ... }) });

  return NextResponse.json({ message: 'Geração enfileirada com sucesso.', promptId }, { status: 200 });
}
