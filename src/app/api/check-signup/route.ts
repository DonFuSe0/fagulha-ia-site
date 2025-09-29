import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/check-signup
 *
 * This endpoint verifies whether the provided email or IP address is eligible
 * for account creation.  It prevents duplicate registrations by email and
 * rate‑limits account creation from the same IP to once every 7 days.
 *
 * Request body: { email: string }
 * Response: { ok: true } on success or { error: string } with 400 status.
 */
export async function POST(req: NextRequest) {
  const supabase = supabaseAdmin();
  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch (_) {
    return NextResponse.json(
      { error: 'Dados inválidos' },
      { status: 400 }
    );
  }
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: 'E‑mail é obrigatório' },
      { status: 400 }
    );
  }
  // Use the forwarded IP header from Vercel/Next.js or fall back to remoteAddress.
  // The x-forwarded-for header may contain multiple comma separated values;
  // take the first one.
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0]?.trim() || (req as any).ip ?? '';

  // Check if the email already exists in profiles (case insensitive).
  const { data: existingEmail, error: emailErr } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (emailErr) {
    console.error('Erro ao verificar email duplicado', emailErr.message);
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
  if (existingEmail) {
    return NextResponse.json(
      { error: 'Este e‑mail já está cadastrado.' },
      { status: 400 }
    );
  }

  // Check if the IP has created an account in the last 7 days.
  if (ip) {
    const { data: ipRow, error: ipErr } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('ip_address', ip)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!ipErr && ipRow) {
      const createdAt = new Date(ipRow.created_at as any);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (diffMs < sevenDaysMs) {
        return NextResponse.json(
          { error: 'Você já criou uma conta recentemente. Tente novamente em alguns dias.' },
          { status: 400 }
        );
      }
    }
  }
  return NextResponse.json({ ok: true });
}
