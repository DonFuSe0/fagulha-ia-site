import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * POST /api/generate
 * Consome tokens do usuário e cria um registro em `generations` com status `queued`.
 * Depois, enfileira a geração na sua API do ComfyUI.
 */
export const runtime = 'nodejs';

type Body = {
  prompt: string;
  negative_prompt?: string;
  model: string;
  style?: string | null;
  width: number;
  height: number;
  steps: number;
  cfg_scale?: number | null;
  seed?: number | null;
  is_public?: boolean;
};

function calcCost(w: number, h: number) {
  // 1 token por imagem base 512x512; proporcionalmente para tamanhos maiores
  const base = 512 * 512;
  const area = Math.max(1, (w || 512) * (h || 512));
  return Math.max(1, Math.ceil(area / base));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Body>;

    if (!body.prompt || !body.model || !body.width || !body.height || !body.steps) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos.' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (uErr || !user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const cost = calcCost(body.width!, body.height!);

    // Debita tokens
    const { error: spendErr } = await supabase.rpc('spend_tokens', {
      p_user: user.id,
      p_cost: cost,
      p_reason: 'GENERATION',
      p_ref: null,
    });
    if (spendErr) {
      return NextResponse.json(
        { error: 'Tokens insuficientes.' },
        { status: 402 }
      );
    }

    // Define expiração: 24h privada, 48h pública
    const now = new Date();
    const ttlHours = body.is_public ? 48 : 24;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    // Cria registro da geração
    const { data: gen, error: genErr } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        prompt: body.prompt,
        negative_prompt: body.negative_prompt ?? null,
        model: body.model,
        style: body.style ?? null,
        width: body.width,
        height: body.height,
        steps: body.steps,
        cfg_scale: body.cfg_scale ?? null,
        seed: body.seed ?? null,
        tokens_used: cost,
        is_public: !!body.is_public,
        status: 'queued',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (genErr || !gen) {
      // Estorna tokens em caso de falha ao criar registro
      await supabase.rpc('credit_tokens', {
        p_user: user.id, p_delta: cost, p_reason: 'REFUND', p_ref: null
      });
      return NextResponse.json(
        { error: 'Não foi possível criar a geração.' },
        { status: 500 }
      );
    }

    // Enfileira no ComfyUI (melhore conforme sua API)
    try {
      const base = process.env.COMFYUI_API_URL || '';
      const payload = {
        id: gen.id,
        prompt: gen.prompt,
        model: gen.model,
        width: gen.width,
        height: gen.height,
        steps: gen.steps,
        webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/comfyui`
      };
      await fetch(`${base.replace(/\/$/, '')}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Se falhar o enfileiramento, marca como failed e estorna tokens
      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Falha ao enfileirar job' })
        .eq('id', gen.id);
      await supabase.rpc('credit_tokens', {
        p_user: user.id, p_delta: cost, p_reason: 'REFUND', p_ref: gen.id
      });
      return NextResponse.json(
        { error: 'Falha ao enfileirar geração.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ id: gen.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro inesperado.' },
      { status: 500 }
    );
  }
}
