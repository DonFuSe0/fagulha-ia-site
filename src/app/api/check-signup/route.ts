import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = supabaseAdmin();
  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch (_) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'E‑mail é obrigatório' }, { status: 400 });
  }

  // Extrai o cabeçalho X-Forwarded-For e divide por vírgula
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  // Usa parênteses ao redor do operador ?? para evitar o erro de precedência
  const ip = forwarded.split(',')[0]?.trim() || ((req as any).ip ?? '');

  // Demais verificações de e-mail duplicado e de IP...
  // ... (resto do código igual ao existente)
}
