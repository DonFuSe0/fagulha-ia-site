import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Pega a URL da API do ComfyUI das nossas variáveis de ambiente
const COMFYUI_API_URL = process.env.COMFYUI_API_URL;

export async function POST(request: Request) {
  // 1. --- Validação do Usuário ---
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
  }

  // 2. --- Validação do Saldo de Tokens ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('token_balance')
    .eq('id', user.id)
    .single();

  const tokenCost = 3; // Custo fixo por enquanto (1024x1024)
  if (!profile || profile.token_balance < tokenCost) {
    return NextResponse.json({ error: 'Tokens insuficientes' }, { status: 402 }); // 402 Payment Required
  }

  // 3. --- Preparação do Payload para o ComfyUI ---
  try {
    const { prompt, negativePrompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'O prompt é obrigatório' }, { status: 400 });
    }

    // Carregamos o workflow que você forneceu
    const workflow = {
      "6": { "inputs": { "text": prompt, "clip": ["11", 0] } },
      "8": { "inputs": { "samples": ["13", 0], "vae": ["10", 0] } },
      "10": { "inputs": { "vae_name": "ae.safetensors" } },
      "11": { "inputs": { "clip_name1": "t5xxl_fp16.safetensors", "clip_name2": "clip_l.safetensors", "type": "flux", "device": "default" } },
      "12": { "inputs": { "unet_name": "flux1-dev.sft", "weight_dtype": "default" } },
      "13": { "inputs": { "noise": ["25", 0], "guider": ["22", 0], "sampler": ["16", 0], "sigmas": ["17", 0], "latent_image": ["27", 0] } },
      "16": { "inputs": { "sampler_name": "euler" } },
      "17": { "inputs": { "scheduler": "simple", "steps": 5, "denoise": 1, "model": ["30", 0] } },
      "22": { "inputs": { "model": ["30", 0], "conditioning": ["26", 0] } },
      "25": { "inputs": { "noise_seed": Math.floor(Math.random() * 1e15) } }, // Semente aleatória
      "26": { "inputs": { "guidance": 3.5, "conditioning": ["6", 0] } },
      "27": { "inputs": { "width": 1024, "height": 1024, "batch_size": 1 } },
      "30": { "inputs": { "max_shift": 1.15, "base_shift": 0.5, "width": 1024, "height": 1024, "model": ["12", 0] } },
      "38": { "inputs": { "images": ["8", 0] } }
    };
    
    // Adiciona o prompt negativo se ele for fornecido
    // (Esta parte precisa de um nó de prompt negativo no workflow, vamos adicionar depois)

    const payload = {
      prompt: workflow,
      // client_id: user.id // Podemos usar o ID do usuário como client_id
    };

    // 4. --- Envio da Requisição para o ComfyUI ---
    const response = await fetch(`${COMFYUI_API_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro na API do ComfyUI: ${response.statusText}`);
    }

    const comfyResponse = await response.json();

    // 5. --- Descontar Tokens (APENAS SE A REQUISIÇÃO FOR ACEITA) ---
    const newBalance = profile.token_balance - tokenCost;
    await supabase
      .from('profiles')
      .update({ token_balance: newBalance })
      .eq('id', user.id);

    // Retorna a resposta do ComfyUI para o frontend
    return NextResponse.json(comfyResponse);

  } catch (error) {
    console.error('Erro na API de geração:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao iniciar a geração', details: errorMessage }, { status: 500 });
  }
}
