import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Se 'next' estiver presente, o usuário será redirecionado para essa rota após o login
  const next = searchParams.get('next') ?? '/dashboard'; // Redireciona para o dashboard por padrão

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // URL para redirecionar em caso de erro
  const errorUrl = `${origin}/login?error=true&error_description=Could not authenticate user`;
  return NextResponse.redirect(errorUrl);
}
