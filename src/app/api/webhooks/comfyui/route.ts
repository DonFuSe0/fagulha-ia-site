import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import crypto from 'crypto';

// Compute HMAC with secret and body
function verifySignature(secret: string, body: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const digest = 'sha256=' + hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const secret = process.env.COMFYUI_WEBHOOK_SECRET as string;
  const signature = req.headers.get('x-signature') || '';
  const body = await req.text();
  if (!verifySignature(secret, body, signature)) {
    return new NextResponse('Invalid signature', { status: 401 });
  }
  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }
  const { id, status, image_url, thumb_url, duration_ms, error_message } = payload;
  const supabase = supabaseServer();
  if (!id) {
    return new NextResponse('Missing id', { status: 400 });
  }
  if (status === 'completed') {
    const { error } = await supabase
      .from('generations')
      .update({
        status: 'completed',
        image_path: image_url,
        thumb_path: thumb_url,
        duration_ms
      })
      .eq('id', id);
    if (error) {
      return new NextResponse('DB error', { status: 500 });
    }
  } else if (status === 'failed') {
    const { error } = await supabase
      .from('generations')
      .update({ status: 'failed', error_message })
      .eq('id', id);
    if (error) {
      return new NextResponse('DB error', { status: 500 });
    }
    // Optionally refund one token
    const gen = await supabase
      .from('generations')
      .select('user_id, tokens_used')
      .eq('id', id)
      .single();
    if (gen.data) {
      await supabase.rpc('credit_tokens', {
        p_user: gen.data.user_id,
        p_delta: Math.ceil(gen.data.tokens_used / 2),
        p_reason: 'REFUND',
        p_ref: id
      });
    }
  }
  return new NextResponse('ok', { status: 200 });
}