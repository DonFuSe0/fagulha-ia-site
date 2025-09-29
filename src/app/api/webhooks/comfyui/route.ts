import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Espera POST do seu orquestrador (ComfyUI API própria).
 * Cabeçalhos:
 *   - X-Webhook-Secret: deve coincidir com COMFYUI_WEBHOOK_SECRET
 * Corpo esperado (exemplo):
 * {
 *   "id": "uuid-da-generation",
 *   "status": "completed" | "failed",
 *   "duration_ms": 12345,
 *   "image_url": "https://.../final.png",   // quando completed
 *   "thumb_url": "https://.../thumb.png",   // opcional
 *   "error": "motivo da falha"              // quando failed
 * }
 */
export async function POST(req: NextRequest) {
  const admin = supabaseAdmin();

  // 1) Validar assinatura simples por header (mantém compat. com seu MVP)
  const secret = process.env.COMFYUI_WEBHOOK_SECRET!;
  const header = req.headers.get('x-webhook-secret');
  if (!secret || !header || header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const id = payload?.id as string | undefined;
  const status = payload?.status as 'completed' | 'failed' | undefined;
  const duration_ms = Number(payload?.duration_ms ?? 0) || null;
  const image_url = payload?.image_url as string | undefined;
  const thumb_url = payload?.thumb_url as string | undefined;
  const error_message = payload?.error as string | undefined;

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing id/status' }, { status: 400 });
  }

  // 2) Buscar a generation para saber tokens e user
  const { data: gen, error: genErr } = await admin
    .from('generations')
    .select('id, user_id, tokens_used, is_public')
    .eq('id', id)
    .single();

  if (genErr || !gen) {
    return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
  }

  // 3) Atualizar conforme status
  if (status === 'completed') {
    // Se sua orquestração já salvou em Storage e envia paths prontos, use-os.
    // Caso esteja recebendo apenas URLs temporárias, você pode baixar e re-subir
    // pro bucket 'generations' aqui (omiti para manter o webhook enxuto).

    const updateObj: any = {
      status: 'completed',
      duration_ms,
      updated_at: new Date().toISOString(),
    };

    if (image_url) updateObj.image_path = image_url;
    if (thumb_url) updateObj.thumb_path = thumb_url;

    const { error: upErr } = await admin
      .from('generations')
      .update(updateObj)
      .eq('id', id);

    if (upErr) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // Se falhou → marca failed + REFUND
  const { error: failErr } = await admin
    .from('generations')
    .update({
      status: 'failed',
      error_message: error_message || 'Falha na geração',
      duration_ms,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (failErr) {
    return NextResponse.json({ error: 'Fail update error' }, { status: 500 });
  }

  // refund total de tokens_used
  const { error: refundErr } = await admin.rpc('credit_tokens', {
    p_user: gen.user_id,
    p_delta: gen.tokens_used,
    p_reason: 'REFUND',
    p_ref: id,
  });

  if (refundErr) {
    return NextResponse.json({ error: 'Refund error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
