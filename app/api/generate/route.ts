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

  // 2. Extração e Validação dos Parâmetros
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
  let tokenCost = 3;
  if (resolution === '512x512') tokenCost = 1;
  if (resolution === '768x768') tokenCost = 2;

  // 4. Verificação de Saldo e Débito de Tokens
  const { error: rpcError } = await supabase.rpc('debit_tokens', {
    user_id_input: userId,
    debit_amount: tokenCost,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 402 });
  }

  // 5. Combinação de Prompts com Estilos
  let finalPrompt = prompt;
  let finalNegativePrompt = negativePrompt || '';

  if (styleId && styleId !== 'none') {
    const { data: style } = await supabase.from('styles').select('*').eq('id', styleId).single();
    if (style) {
      finalPrompt = `${style.prompt_prefix || ''} ${prompt} ${style.prompt_suffix || ''}`.trim();
      finalNegativePrompt = `${style.negative_prompt_prefix || ''} ${negativePrompt || ''} ${style.negative_prompt_suffix || ''}`.trim();
    }
  }

  // 6. Preparação para o ComfyUI
  const { data: model } = await supabase.from('models').select('comfyui_workflow_name').eq('id', modelId).single();
  if (!model) {
    return NextResponse.json({ error: 'Modelo de IA não encontrado.' }, { status: 404 });
  }
  const promptId = crypto.randomUUID();

  // 7. Registro da Geração no Banco de Dados (com status 'processing')
  //    *** A MUDANÇA ESTÁ AQUI ***
  const { error: insertError } = await supabase.from('generations').insert({
    id: promptId,
    user_id: userId,
    prompt: finalPrompt,
    negative_prompt: finalNegativePrompt,
    status: 'processing',
    model_id: modelId, // Salva o ID do modelo
    style_id: styleId !== 'none' ? styleId : null, // Salva o ID do estilo (ou null se nenhum)
    resolution: resolution, // Salva a resolução
    steps: steps, // Salva os steps
  });

  if (insertError) {
    console.error('Erro ao inserir geração:', insertError);
    return NextResponse.json({ error: 'Erro ao registrar a geração: ' + insertError.message }, { status: 500 });
  }

  // 8. Envio da Tarefa para o ComfyUI (simulado)
  console.warn('COMFYUI_API_URL não está definida. Simulando sucesso da API.');
  return NextResponse.json({ message: 'Geração enfileirada com sucesso (simulado).', promptId }, { status: 200 });
}
