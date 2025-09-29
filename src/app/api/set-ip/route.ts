import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/set-ip
 *
 * Updates the ip_address of a newly created user.  This route
 * requires a service‑role key and should only be called from the server
 * or after sign up.  The body must contain `userId` and `ip`.
 */
export async function POST(req: NextRequest) {
  const supabase = supabaseAdmin();
  let body: { userId?: string; ip?: string } = {};
  try {
    body = await req.json();
  } catch (_) {
    return NextResponse.json(
      { error: 'Dados inválidos' },
      { status: 400 }
    );
  }
  const { userId, ip } = body;
  if (!userId || !ip) {
    return NextResponse.json(
      { error: 'userId e ip são obrigatórios' },
      { status: 400 }
    );
  }
  const { error } = await supabase
    .from('profiles')
    .update({ ip_address: ip })
    .eq('id', userId);
  if (error) {
    console.error('Erro ao atualizar ip_address', error.message);
    return NextResponse.json(
      { error: 'Não foi possível atualizar o endereço IP.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
