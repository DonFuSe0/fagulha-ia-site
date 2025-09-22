import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Criamos um cliente Supabase com a chave de serviço para ter permissões de admin
// Isso é necessário para que o webhook possa escrever no banco de dados sem um usuário logado.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // 1. --- Validação do Segredo do Webhook ---
  const { webhook_secret, prompt_id, status, outputs } = await request.json();

  if (webhook_secret !== process.env.COMFYUI_WEBHOOK_SECRET) {
    console.warn('Webhook recebido com segredo inválido.');
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
  }

  console.log(`Webhook recebido para o prompt_id: ${prompt_id}, status: ${status}`);

  try {
    // 2. --- Processamento baseado no Status ---
    if (status === 'succeeded' && outputs && outputs.length > 0) {
      // Encontra a URL da imagem nos outputs do ComfyUI
      // A estrutura exata pode variar com seu workflow, ajuste se necessário
      const imageUrl = outputs[0]?.images[0]?.filename; 
      const finalImageUrl = `${process.env.COMFYUI_API_URL}/view?filename=${imageUrl}`;

      if (!imageUrl) {
        throw new Error('Não foi possível encontrar a URL da imagem nos outputs do webhook.');
      }

      // 3. --- Atualiza o registro no Banco de Dados ---
      const { error } = await supabaseAdmin
        .from('generations')
        .update({ 
          status: 'succeeded', 
          image_url: finalImageUrl 
        })
        .eq('prompt_id', prompt_id);

      if (error) {
        throw new Error(`Erro ao atualizar a geração no banco de dados: ${error.message}`);
      }

      console.log(`Geração ${prompt_id} atualizada com sucesso com a imagem: ${finalImageUrl}`);

    } else if (status === 'failed' || status === 'error') {
      // Se a geração falhou, atualizamos o status para 'failed'
      const { error } = await supabaseAdmin
        .from('generations')
        .update({ status: 'failed' })
        .eq('prompt_id', prompt_id);
      
      if (error) {
        throw new Error(`Erro ao atualizar a geração para 'failed': ${error.message}`);
      }
      // Aqui poderíamos adicionar lógica para reembolsar os tokens do usuário
    }

    // 4. --- Responde ao ComfyUI ---
    return NextResponse.json({ message: 'Webhook recebido com sucesso' });

  } catch (error) {
    console.error('Erro no processamento do webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao processar o webhook', details: errorMessage }, { status: 500 });
  }
}
