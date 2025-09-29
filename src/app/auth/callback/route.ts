export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const redirect = url.searchParams.get('redirect') || '/dashboard';

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}`, origin));
  }
  if (!code) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent('missing_code')}`, origin));
  }

  const supabase = supabaseServer();
  const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);

  if (exErr) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(exErr.message)}`, origin));
  }

  // Sessão gravada em cookie via supabaseServer() (cookies.set)
  return NextResponse.redirect(new URL(redirect, origin));
}
