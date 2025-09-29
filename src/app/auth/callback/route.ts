export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;

  const code = url.searchParams.get('code');
  const type = (url.searchParams.get('type') || '').toLowerCase(); // signup, recovery, etc.
  const destination = url.searchParams.get('redirect') || '/dashboard';

  // Qualquer retorno de confirmação via e-mail NÃO tenta exchange; volta ao login com aviso.
  if (['signup', 'email_change', 'recovery', 'magiclink'].includes(type)) {
    return NextResponse.redirect(
      new URL(`/auth/login?msg=${encodeURIComponent('Conta confirmada. Faça login para continuar.')}`, origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent('missing_code')}`, origin));
  }

  const supabase = supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const m = error.message?.toLowerCase() || '';
    if (m.includes('code verifier')) {
      return NextResponse.redirect(
        new URL(`/auth/login?msg=${encodeURIComponent('Conta confirmada. Faça login para continuar.')}`, origin)
      );
    }
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, origin));
  }

  // Sucesso (OAuth): sessão definida no cookie
  return NextResponse.redirect(new URL(destination, origin));
}
