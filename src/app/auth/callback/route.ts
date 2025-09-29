import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// This route is invoked by the Supabase OAuth redirect.  After
// Supabase processes the OAuth callback, it will redirect the user
// here.  We capture the session (which Supabase stores in cookies)
// then redirect to the dashboard.
export async function GET(request: Request) {
  const supabase = supabaseServer();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  // Determine the origin dynamically from the incoming request.
  const url = new URL(request.url);
  const origin = url.origin;
  // If the user is authenticated, redirect to dashboard
  if (session) {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }
  // Otherwise, go to login
  return NextResponse.redirect(new URL('/auth/login', origin));
}
