export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Esta rota trata os retornos do Supabase:
 *  - OAuth (Google) -> troca o ?code por sessão e redireciona ao destino.
 *  - Confirmação por e-mail (type=signup / email_change / recovery):
 *      alguns links não têm code_verifier -> não dá para "exchange".
 *      Nestes casos, confirmamos visualmente e pedimos login.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;

  const code = url.searchParams.get('code');
  const type = url.searchParams.get('type') || ''; // signup | recovery | email_change | magiclink | oauth etc
  const destination = url.searchParams.get('redirect') || '/dashboard';

  // Se for um retorno explícito desses tipos "de e-mail", redireciona com aviso
  // (sem tentar exchange, pois geralmente falta code_verifier).
  if (['signup', 'email_change', 'recovery', 'magiclink'].includes(type)) {
    return NextResponse.redirect(
      new URL(`/auth/login?msg=${encodeURIComponent('Conta confirmada. Faça login para continuar.')}`, origin)
    );
  }

  if (!code) {
    // Sem code: apenas volte ao login com erro.
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('missing_code')}`, origin)
    );
  }

  // Tenta trocar o code por uma sessão (funciona para OAuth/PKCE).
  const supabase = supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const msg = error.message?.toLowerCase() || '';

    // Caso clássico de confirmação por e-mail sem code_verifier no cookie.
    if (msg.includes('code verifier')) {
      return NextResponse.redirect(
        new URL(`/auth/login?msg=${encodeURIComponent('Conta confirmada. Faça login para continuar.')}`, origin)
      );
    }

    // Qualquer outro erro -> volta com mensagem
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  // Sucesso (OAuth): sessão gravada no cookie via supabaseServer()
  return NextResponse.redirect(new URL(destination, origin));
}
