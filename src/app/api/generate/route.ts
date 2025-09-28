import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';

const requestSchema = z.object({
  prompt: z.string().min(1),
  negative_prompt: z.string().optional(),
  model: z.string(),
  style: z.string().optional(),
  width: z.number(),
  height: z.number(),
  steps: z.number()
});

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  // Ensure user is authenticated
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 });
  }
  const data = parsed.data;
  // Calculate token cost: 1 token per 512x512 area
  const base = 512 * 512;
  const area = data.width * data.height;
  const cost = Math.ceil(area / base);
  // Check balance and spend tokens
  try {
    await supabase.rpc('spend_tokens', {
      p_user: session.user.id,
      p_cost: cost,
      p_reason: 'GENERATION',
      p_ref: null
    });
  } catch (e: any) {
    return NextResponse.json({ message: 'Saldo insuficiente' }, { status: 402 });
  }
  // Insert generation row with status queued
  const { data: gen, error } = await supabase
    .from('generations')
    .insert({
      user_id: session.user.id,
      prompt: data.prompt,
      negative_prompt: data.negative_prompt,
      model: data.model,
      style: data.style,
      width: data.width,
      height: data.height,
      steps: data.steps,
      tokens_used: cost,
      status: 'queued',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
    .select('*')
    .single();
  if (error || !gen) {
    return NextResponse.json({ message: error?.message || 'Erro ao registrar geração' }, { status: 500 });
  }
  // TODO: enqueue job in ComfyUI via COMFYUI_API_URL
  // For now we just return the generation id
  return NextResponse.json({ id: gen.id });
}