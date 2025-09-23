import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.json();
  const { webhook_secret, prompt_id, status, outputs } = body;

  // 1. Validação de Segurança
  if (webhook_secret !== process.env.COMFYUI_WEBHOOK_SECRET) {
    console.warn('Webhook do ComfyUI recebido com segredo inválido.');
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
  }

  if (!prompt_id || !status) {
    return NextResponse.json({ error: 'Dados do webhook incompletos' }, { status: 400 });
  }

  try {
    let updateData: { status: string; image_url?: string } = { status };

    if (status === 'succeeded' && outputs && outputs.length > 0) {
      const imageUrl = `${process.env.COMFYUI_API_URL}/view?filename=${outputs[0].filename}&subfolder=${outputs[0].subfolder}&type=${outputs[0].type}`;
      updateData.image_url = imageUrl;
    }

    const { error } = await supabaseAdmin
      .from('generations')
      .update(updateData)
      .eq('prompt_id', prompt_id);

    if (error) {
      throw new Error(`Erro ao atualizar geração no Supabase: ${error.message}`);
    }

    console.log(`Status da geração ${prompt_id} atualizado para ${status}.`);
    return NextResponse.json({ message: 'Webhook processado com sucesso' });

  } catch (error) {
    console.error('Erro no processamento do webhook do ComfyUI:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
