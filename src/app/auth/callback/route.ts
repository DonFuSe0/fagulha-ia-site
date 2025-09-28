import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// This route is invoked by the Supabase OAuth redirect.  After
// Supabase processes the OAuth callback, it will redirect the user
// here.  We capture the session (which Supabase stores in cookies)
// then redirect to the dashboard.
export async function GET() {
  const supabase = supabaseServer();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  // If the user is authenticated, redirect to dashboard
  if (session) {
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL));
  }
  // Otherwise, go to login
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL));
}