import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';

/**
 * Supabase redireciona o usuário para esta rota após o login via link mágico
 * (code). Troca o código pelo token de sessão e redireciona para o dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = supabaseRoute();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/dashboard`);
}