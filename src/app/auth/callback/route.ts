import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// This route is invoked by the Supabase OAuth redirect.  After
// Supabase processes the OAuth callback, it will redirect the user
// here.  We capture the session (which Supabase stores in cookies)
// then redirect to the dashboard.
export async function GET(request: Request) {
  const supabase = supabaseServer();
  // Supabase OAuth provider redirects back with a `code` parameter.
  // We must exchange this code for a session before using getSession().
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    try {
      // exchangeCodeForSession will set the `supabase-auth-token` cookie
      // which supabaseServer() will pick up automatically on subsequent requests.
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('Erro ao trocar código por sessão', err);
    }
  }
  // Now attempt to load the session from cookies
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const origin = url.origin;
  // If the user is authenticated, redirect to dashboard
  if (session) {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }
  // Otherwise, go to login
  return NextResponse.redirect(new URL('/auth/login', origin));
}
