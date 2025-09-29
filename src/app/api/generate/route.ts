import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  prompt: z.string().min(1),
  negative_prompt: z.string().optional(),
  model: z.string().min(1),
  style: z.string().optional(),
  width: z.coerce.number().int().min(64).max(2048),
  height: z.coerce.number().int().min(64).max(2048),
  steps: z.coerce.number().int().min(1).max(150),
  cfg_scale: z.coerce.number().optional(),
  seed: z.coerce.number().optional(),
  is_public: z.coerce.boolean().optional()
});

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const admin = supabaseAdmin();

  // Auth
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  const user = userRes.user;

  // Validate
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(bodyJson);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

  // Custo (512x512 = 1 token)
  const base = 512 * 512;
  const cost = Math.max(1, Math.ceil((body.width * body.height) / base));

  // Debitar tokens (RPC SECURITY DEFINER)
  const { error: spendErr } = await admin.rpc('spend_tokens', {
    p_user: user.id,
    p_cost: cost,
    p_reason: 'GENERATION',
    p_ref: null
  });
  if (spendErr) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 402 });
  }

  // Inserir geração
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ((body.is_public ? 48 : 24) * 60 * 60 * 1000));

  const insertPayload = {
    user_id: user.id,
    prompt: body.prompt,
    negative_prompt: body.negative_prompt ?? null,
    model: body.model,
    style: body.style ?? null,
    width: body.width,
    height: body.height,
    steps: body.steps,
    seed: body.seed ?? null,
    cfg_scale: body.cfg_scale ?? null,
    status: 'queued' as const,
    is_public: !!body.is_public,
    image_path: null as string | null,
    thumb_path: null as string | null,
    tokens_used: cost,
    duration_ms: null as number | null,
    error_message: null as string | null,
    metadata: null as any,
    expires_at: expiresAt.toISOString()
  };

  const { data: gen, error: genErr } = await admin
    .from('generations')
    .insert(insertPayload)
    .select()
    .single();

  if (genErr || !gen) {
    // refund
    await admin.rpc('credit_tokens', {
      p_user: user.id,
      p_delta: cost,
      p_reason: 'REFUND',
      p_ref: null
    });
    return NextResponse.json({ error: 'Erro ao criar geração' }, { status: 500 });
  }

  // Enfileirar no ComfyUI
  try {
    const apiUrl = process.env.COMFYUI_API_URL!;
    const webhookSecret = process.env.COMFYUI_WEBHOOK_SECRET!;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const callback = `${siteUrl}/api/webhooks/comfyui`;

    // Ajuste o payload conforme sua API do ComfyUI
    const enqueueBody = {
      id: gen.id,
      prompt: body.prompt,
      negative_prompt: body.negative_prompt ?? undefined,
      model: body.model,
      width: body.width,
      height: body.height,
      steps: body.steps,
      seed: body.seed,
      cfg_scale: body.cfg_scale,
      callback_url: callback
    };

    await fetch(`${apiUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify(enqueueBody)
    });
  } catch (e: any) {
    // marcar como falha + refund
    await admin.from('generations').update({
      status: 'failed',
      error_message: e?.message ?? 'Erro ao enfileirar'
    }).eq('id', gen.id);

    await admin.rpc('credit_tokens', {
      p_user: user.id,
      p_delta: cost,
      p_reason: 'REFUND',
      p_ref: gen.id
    });

    return NextResponse.json({ id: gen.id, status: 'failed' }, { status: 202 });
  }

  return NextResponse.json({ id: gen.id }, { status: 200 });
}
