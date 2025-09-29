import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// Garante execução no Node
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Rota de retorno (Google / links de e-mail).
 * Troca o "code" por sessão, grava cookies httpOnly e redireciona.
 *
 * Ex.: /auth/callback?code=...&next=/dashboard
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/dashboard';

  const supabase = supabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // se falhar, manda para login com erro
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // redireciona para o destino (dashboard por padrão)
  return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_SITE_URL));
}
