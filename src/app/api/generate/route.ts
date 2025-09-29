// Caminho: src/app/api/generate/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';

const schema = z.object({
  prompt: z.string().min(1),
  negative_prompt: z.string().optional(),
  model: z.string().min(1),
  style: z.string().nullable().optional(),
  width: z.number().int().min(64).max(2048),
  height: z.number().int().min(64).max(2048),
  steps: z.number().int().min(1).max(200),
  cfg_scale: z.number().min(0).max(30).nullable().optional(),
  seed: z.number().int().optional(),
  is_public: z.boolean().optional(),
});

function calcCost(width: number, height: number) {
  // 1 token por 512x512; escala por área.
  const base = 512 * 512;
  return Math.max(1, Math.ceil((width * height) / base));
}

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Payload inválido', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const dto = parsed.data;
    const cost = calcCost(dto.width, dto.height);
    const expiresAt = new Date(
      Date.now() + (dto.is_public ? 48 : 24) * 60 * 60 * 1000
    ).toISOString();

    // Debita tokens (RPC atômico)
    const { error: spendErr } = await supabase.rpc('spend_tokens', {
      p_user: user.id,
      p_cost: cost,
      p_reason: 'GENERATION',
      p_ref: null,
    });
    if (spendErr) {
      return NextResponse.json(
        { message: 'Tokens insuficientes' },
        { status: 402 } // Payment Required
      );
    }

    // Cria registro de geração
    const { data: gen, error: genErr } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        prompt: dto.prompt,
        negative_prompt: dto.negative_prompt ?? null,
        model: dto.model,
        style: dto.style ?? null,
        width: dto.width,
        height: dto.height,
        steps: dto.steps,
        seed: dto.seed ?? null,
        cfg_scale: dto.cfg_scale ?? null,
        tokens_used: cost,
        is_public: !!dto.is_public,
        status: 'queued',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (genErr || !gen) {
      // Estorna tokens em caso de erro
      await supabase.rpc('credit_tokens', {
        p_user: user.id,
        p_delta: cost,
        p_reason: 'REFUND',
        p_ref: null,
      });
      return NextResponse.json(
        { message: 'Falha ao enfileirar geração' },
        { status: 500 }
      );
    }

    // Enfileira no ComfyUI (opcional)
    const api = process.env.COMFYUI_API_URL;
    if (api) {
      try {
        await fetch(`${api}/jobs`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: gen.id,
            prompt: dto.prompt,
            negative_prompt: dto.negative_prompt ?? null,
            model: dto.model,
            width: dto.width,
            height: dto.height,
            steps: dto.steps,
            seed: dto.seed ?? undefined,
            cfg_scale: dto.cfg_scale ?? undefined,
            webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/webhooks/comfyui`,
          }),
        });
      } catch {
        // Não bloqueia a resposta; o webhook tratará timeouts/erros
      }
    }

    return NextResponse.json({ id: gen.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || 'Erro inesperado' },
      { status: 500 }
    );
  }
}
