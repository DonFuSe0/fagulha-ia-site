import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Carrega as variáveis de ambiente
const COMFYUI_API_URL = process.env.COMFYUI_API_URL;
const WEBHOOK_SECRET = process.env.COMFYUI_WEBHOOK_SECRET;
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export async function POST(request: Request) {
  // 1. Validação do Usuário
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
  }

  // 2. Validação do Saldo de Tokens
  const { data: profile } = await supabase.from('profiles').select('token_balance').eq('id', user.id).single();
  const tokenCost = 3; // Custo para imagem 1024x1024
  if (!profile || profile.token_balance < tokenCost) {
    return NextResponse.json({ error: 'Tokens insuficientes' }, { status: 402 });
  }

  try {
    // 3. Extração e Validação do Prompt
    const { prompt, negativePrompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'O prompt é obrigatório' }, { status: 400 });
    }

    // 4. Preparação do Workflow do ComfyUI (com o nó de Webhook corrigido)
    const workflow = {
      "6": { "inputs": { "text": prompt, "clip": ["11", 0] }, "class_type": "CLIPTextEncode" },
      "8": { "inputs": { "samples": ["13", 0], "vae": ["10", 0] }, "class_type": "VAEDecode" },
      "10": { "inputs": { "vae_name": "ae.safetensors" }, "class_type": "VAELoader" },
      "11": { "inputs": { "clip_name1": "t5xxl_fp16.safetensors", "clip_name2": "clip_l.safetensors", "type": "flux", "device": "default" }, "class_type": "DualCLIPLoader" },
      "12": { "inputs": { "unet_name": "flux1-dev.sft", "weight_dtype": "default" }, "class_type": "UNETLoader" },
      "13": { "inputs": { "noise": ["25", 0], "guider": ["22", 0], "sampler": ["16", 0], "sigmas": ["17", 0], "latent_image": ["27", 0] }, "class_type": "SamplerCustomAdvanced" },
      "16": { "inputs": { "sampler_name": "euler" }, "class_type": "KSamplerSelect" },
      "17": { "inputs": { "scheduler": "simple", "steps": 5, "denoise": 1, "model": ["30", 0] }, "class_type": "BasicScheduler" },
      "22": { "inputs": { "model": ["30", 0], "conditioning": ["26", 0] }, "class_type": "BasicGuider" },
      "25": { "inputs": { "noise_seed": Math.floor(Math.random() * 1e15) }, "class_type": "RandomNoise" },
      "26": { "inputs": { "guidance": 3.5, "conditioning": ["6", 0] }, "class_type": "FluxGuidance" },
      "27": { "inputs": { "width": 1024, "height": 1024, "batch_size": 1 }, "class_type": "EmptySD3LatentImage" },
      "30": { "inputs": { "max_shift": 1.15, "base_shift": 0.5, "width": 1024, "height": 1024, "model": ["12", 0] }, "class_type": "ModelSamplingFlux" },
      "38": { "inputs": { "images": ["8", 0] }, "class_type": "PreviewImage" },
      "42": { // NÓ DE WEBHOOK CORRIGIDO
        "inputs": {
          "url": `${NEXT_PUBLIC_SITE_URL}/api/webhook`,
          "passthrough": ["38", 0], // Conectado à saída do PreviewImage para garantir a execução no final
          "json_data": `{\n  "webhook_secret": "${WEBHOOK_SECRET}",\n  "prompt_id": "{prompt_id}",\n  "status": "{status}",\n  "outputs": {outputs}\n}`
        },
        "class_type": "Webhook" // O nome da classe é simplesmente "Webhook"
      }
    };

    // 5. Construção do Payload Final
    const payload = {
      prompt: workflow,
    };

    // 6. Envio para a API do ComfyUI
    const response = await fetch(`${COMFYUI_API_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro na API do ComfyUI: ${await response.text()}`);
    }
    const comfyResponse = await response.json();
    const promptId = comfyResponse.prompt_id;

    if (!promptId) {
      throw new Error('A resposta do ComfyUI não continha um prompt_id.');
    }

    // 7. Salvar o registro da geração no nosso banco de dados
    const { error: insertError } = await supabase.from('generations').insert({
      user_id: user.id,
      prompt_id: promptId,
      prompt: prompt,
      negative_prompt: negativePrompt,
      width: 1024,
      height: 1024,
      cost: tokenCost,
      status: 'processing',
    });

    if (insertError) {
      throw new Error(`Erro ao salvar geração no banco de dados: ${insertError.message}`);
    }
    
    // 8. Descontar os tokens do usuário
    const newBalance = profile.token_balance - tokenCost;
    await supabase.from('profiles').update({ token_balance: newBalance }).eq('id', user.id);

    // 9. Retornar a resposta para o frontend
    return NextResponse.json(comfyResponse);

  } catch (error) {
    console.error('Erro na API de geração:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao iniciar a geração', details: errorMessage }, { status: 500 });
  }
}
