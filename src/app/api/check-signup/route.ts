import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/check-signup
 *
 * Verifica se é permitido criar uma nova conta com o e‑mail e o IP informados.
 * Bloqueia e‑mails duplicados e restringe criação múltipla por IP (7 dias).
 */
export async function POST(req: NextRequest) {
  const supabase = supabaseAdmin();
  let body: { email?: string } = {};

  // Lê o JSON do corpo
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Dados inválidos' },
      { status: 400 }
    );
  }

  // Normaliza o e-mail
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: 'E‑mail é obrigatório' },
      { status: 400 }
    );
  }

  // Obtém o IP: primeiro tenta "x-forwarded-for", depois req.ip
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  let ip = '';
  const parts = forwarded.split(',');
  if (parts.length > 0 && parts[0].trim()) {
    ip = parts[0].trim();
  }
  if (!ip && (req as any).ip) {
    ip = (req as any).ip;
  }

  // Verifica e‑mail duplicado
  const { data: existingEmail, error: emailErr } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (emailErr) {
    console.error('Erro ao verificar e‑mail', emailErr.message);
    return NextResponse.json(
      { error: 'Erro interno.' },
      { status: 500 }
    );
  }

  if (existingEmail) {
    return NextResponse.json(
      { error: 'Este e‑mail já está cadastrado.' },
      { status: 400 }
    );
  }

  // Verifica criação por IP (últimos 7 dias)
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
          {
            error:
              'Você já criou uma conta recentemente. Tente novamente em alguns dias.',
          },
          { status: 400 }
        );
      }
    }
  }

  // Liberado
  return NextResponse.json({ ok: true });
}
