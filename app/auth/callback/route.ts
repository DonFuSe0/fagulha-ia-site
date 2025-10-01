import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';

function toPtBr(msg?: string) {
  const m = (msg || '').toLowerCase();
  if (!msg) return 'Não foi possível concluir a autenticação.';
  if (m.includes('code')) return 'Código de autenticação inválido ou expirado.';
  if (m.includes('session')) return 'Não foi possível criar a sessão.';
  return 'Não foi possível concluir a autenticação.';
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const supabase = supabaseRoute();

  const { error } = await supabase.auth.exchangeCodeForSession();
  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=' + encodeURIComponent(toPtBr(error.message)), url));
  }

  // Redireciona para página de boas-vindas após confirmar/entrar
  return NextResponse.redirect(new URL('/bemvindo', url));
}
