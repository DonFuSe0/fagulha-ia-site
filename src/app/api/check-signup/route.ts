import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/check-signup
 *
 * Verifica se o e‑mail/IP podem criar uma nova conta.
 * Bloqueia e‑mails duplicados e restringe criação múltipla por IP (7 dias).
 */
export async function POST(req: NextRequest) {
  const supabase = supabaseAdmin();
  let body: { email?: string } = {};

  // Tenta ler o JSON do corpo da requisição
  try {
    body = await req.json();
  } catch (_) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  // Normaliza e valida o e‑mail
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'E‑mail é obrigatório' }, { status: 400 });
  }

  /** 
   * Obtém o IP do cliente. Para evitar o erro de misturar
   * `??` e `||`, não usamos os dois operadores na mesma expressão.
   * 1. Tenta pegar o primeiro IP do header `x-forwarded-for`.
   * 2. Caso ausente, tenta pegar o IP da requisição (`req.ip`).
   */
  const forwardedHeader = req.headers.get('x-forwarded-for');
  let ip = '';
  if (forwardedHeader) {
    const first = forwardedHeader.split(',')[0]?.trim();
    if (first) {
      ip = first;
    }
  }
  const reqIp = (req as any).ip;
  if (!ip && reqIp) {
    ip = reqIp;
  }

  // Verifica se já existe conta com esse e‑mail (insensível a maiúsculas/minúsculas)
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

  // Verifica se esse IP criou conta nos últimos 7 dias
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

  // Se passou em todas as verificações, libera a criação
  return NextResponse.json({ ok: true });
}
