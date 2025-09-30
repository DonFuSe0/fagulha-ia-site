import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';

/**
 * Endpoint para sair da aplicação. Remove a sessão do usuário atual e
 * redireciona de volta para a página inicial.
 */
export async function POST(request: NextRequest) {
  const supabase = supabaseRoute();
  await supabase.auth.signOut();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`);
}