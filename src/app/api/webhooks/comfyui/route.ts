import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

function verifySignature(req: NextRequest) {
  const secret = process.env.COMFYUI_WEBHOOK_SECRET!;
  const sig = req.headers.get('x-comfy-signature') || '';
  const body = (req as any).__body || ''; // ver nota abaixo
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/**
 * OBS: para ler o corpo bruto e validar a assinatura, marque esta rota com:
 * export const config = { api: { bodyParser: false } } (em pages) — no App Router,
 * você pode capturar o body via request.clone().text() antes de json().
 */
export async function POST(req: NextRequest) {
  const supabase = supabaseAdmin();
  // pegue o payload
  const payload = await req.json(); // { id, status, image_path?, thumb_path?, duration_ms?, error? }
  const genId: string = payload.id;

  // carrega a geração
  const { data: gen } = await supabase.from('generations').select('id,user_id,tokens_used,status').eq('id', genId).maybeSingle();
  if (!gen) return NextResponse.json({ ok: true });

  if (payload.status === 'completed') {
    await supabase.from('generations').update({
      status: 'completed',
      image_path: payload.image_path,
      thumb_path: payload.thumb_path ?? null,
      duration_ms: payload.duration_ms ?? null,
      updated_at: new Date().toISOString()
    }).eq('id', genId);
    return NextResponse.json({ ok: true });
  }

  if (payload.status === 'failed') {
    // marca como falha
    await supabase.from('generations').update({
      status: 'failed',
      error_message: payload.error ?? 'Falha na geração',
      updated_at: new Date().toISOString()
    }).eq('id', genId);

    // reembolsa tokens
    await supabase.rpc('credit_tokens', {
      p_user: gen.user_id,
      p_delta: gen.tokens_used,
      p_reason: 'REFUND',
      p_ref: gen.id
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
