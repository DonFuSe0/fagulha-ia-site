import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = supabaseRoute();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/dashboard`);
}
