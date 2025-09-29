export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';

const BodySchema = z.object({
  prompt: z.string().min(3),
  negative_prompt: z.string().optional().default(''),
  model: z.string().min(1),
  style: z.string().optional().default(''),
  width: z.number().int().min(256).max(2048),
  height: z.number().int().min(256).max(2048),
  steps: z.number().int().min(1).max(150),
  cfg_scale: z.number().min(0).max(30).default(7),
  seed: z.number().int().optional(),
  is_public: z.boolean().optional().default(false),
});

function costForSize(w: number, h: number) {
  const base = 512 * 512;
  const pixels = w * h;
  return Math.max(1, Math.ceil(pixels / base)); // 512^2 = 1 token; proporcional
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  try {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
    }

    const raw = await req.json();
    const body = BodySchema.parse(raw);

    const tokens = costForSize(body.width, body.height);

    // Debita tokens via RPC (SECURITY DEFINER)
    const { data: spendOk, error: spendErr } = await supabase.rpc('spend_tokens', {
      p_user: user.id,
      p_cost: tokens,
      p_reason: 'GENERATION',
      p_ref: null,
    });

    if (spendErr) {
      return NextResponse.json({ error: 'insufficient_tokens', details: spendErr.message }, { status: 402 });
    }

    // Cria geração
    const insertPayload = {
      user_id: user.id,
      prompt: body.prompt,
      negative_prompt: body.negative_prompt,
      model: body.model,
      style: body.style,
      width: body.width,
      height: body.height,
      steps: body.steps,
      seed: body.seed ?? null,
      cfg_scale: body.cfg_scale,
      status: 'queued',
      is_public: body.is_public,
      tokens_used: tokens,
      metadata: {},
    };

    const { data: gen, error: insErr } = await supabase
      .from('generations')
      .insert(insertPayload)
      .select('id')
      .single();

    if (insErr || !gen) {
      // Estorna tokens
      await supabase.rpc('credit_tokens', {
        p_user: user.id,
        p_delta: tokens,
        p_reason: 'REFUND',
        p_ref: null,
      });
      return NextResponse.json({ error: 'insert_failed', details: insErr?.message }, { status: 500 });
    }

    // Enfileira no ComfyUI (sua API)
    const apiUrl = process.env.COMFYUI_API_URL;
    if (!apiUrl) {
      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'COMFYUI_API_URL not set' })
        .eq('id', gen.id);
      // estorno
      await supabase.rpc('credit_tokens', {
        p_user: user.id,
        p_delta: tokens,
        p_reason: 'REFUND',
        p_ref: gen.id,
      });
      return NextResponse.json({ error: 'missing_api', details: 'COMFYUI_API_URL not set' }, { status: 500 });
    }

    try {
      // exemplo: adapte ao seu payload
      await fetch(`${apiUrl}/jobs`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: gen.id, prompt: body.prompt, width: body.width, height: body.height }),
      });
    } catch (e: any) {
      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: e?.message || 'enqueue_failed' })
        .eq('id', gen.id);
      await supabase.rpc('credit_tokens', {
        p_user: user.id,
        p_delta: tokens,
        p_reason: 'REFUND',
        p_ref: gen.id,
      });
      return NextResponse.json({ error: 'enqueue_failed', details: e?.message }, { status: 500 });
    }

    return NextResponse.json({ id: gen.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', details: e?.message }, { status: 500 });
  }
}
