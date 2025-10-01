import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const supabase = supabaseRoute();
  // Ignora erro, queremos apenas limpar cookies/sessão
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/?s=logout', url), 303);
}

export async function GET(req: NextRequest) {
  // Opcional: suportar GET também (se alguém acessar via link)
  return POST(req);
}
