import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const COMFYUI_API_URL = process.env.COMFYUI_API_URL;
const WEBHOOK_SECRET = process.env.COMFYUI_WEBHOOK_SECRET;
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('token_balance').eq('id', user.id).single();
  const tokenCost = 3;
  if (!profile || profile.token_balance < tokenCost) {
    return NextResponse.json({ error: 'Tokens insuficientes' }, { status: 402 });
  }

  try {
    const { prompt, negativePrompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: 'O prompt é obrigatório' }, { status: 400 });

    const workflow = { /* ... seu workflow JSON completo aqui ... */ };
    workflow["6"].inputs.text = prompt;
    workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1e15);
    
    // Construindo o payload para o ComfyUI com webhook
    const payload = {
      prompt: workflow,
      extra_data: {
        webhook_url: `${NEXT_PUBLIC_SITE_URL}/api/webhook`,
        webhook_secret: WEBHOOK_SECRET,
      }
    };

    const response = await fetch(`${COMFYUI_API_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Erro na API do ComfyUI: ${response.statusText}`);
    const comfyResponse = await response.json();
    const promptId = comfyResponse.prompt_id;

    // --- NOVO: Salvar no banco de dados ---
    const { error: insertError } = await supabase.from('generations').insert({
      user_id: user.id,
      prompt_id: promptId,
      prompt: prompt,
      negative_prompt: negativePrompt,
      width: 1024,
      height: 1024,
      cost: tokenCost,
      status: 'processing', // Já consideramos como "processando"
    });

    if (insertError) throw new Error(`Erro ao salvar geração: ${insertError.message}`);
    
    // --- Descontar Tokens ---
    const newBalance = profile.token_balance - tokenCost;
    await supabase.from('profiles').update({ token_balance: newBalance }).eq('id', user.id);

    return NextResponse.json(comfyResponse);

  } catch (error) {
    console.error('Erro na API de geração:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao iniciar a geração', details: errorMessage }, { status: 500 });
  }
}
