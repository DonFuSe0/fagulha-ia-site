import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// This route is invoked by the Supabase OAuth redirect.  After
// Supabase processes the OAuth callback, it will redirect the user
// here.  We capture the session (which Supabase stores in cookies)
// then redirect to the dashboard.
export async function GET(request: Request) {
  const supabase = supabaseServer();
  // Supabase OAuth provider redirects back with a `code` parameter.
  // We must exchange this code for a session before checking user
  // information.  If no code is provided, we skip exchange.
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    try {
      // This call sets an HTTP‑only cookie containing the session
      // token.  With our updated cookie implementation, it is
      // written at the root path so that subsequent requests can
      // access it.
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('Erro ao trocar código por sessão', err);
    }
  }
  // Always read the origin before asynchronous operations, since
  // `request.url` may be garbage collected after awaiting supabase.
  const origin = url.origin;
  // We use getUser instead of getSession because getUser triggers
  // a token refresh and revalidates the Auth token with Supabase.
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }
  // Otherwise, go to login
  return NextResponse.redirect(new URL('/auth/login', origin));
}
