import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';

function mapErrorToPtBr(message: string): string {
  const msg = (message || '').toLowerCase();
  if (msg.includes('email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  if (msg.includes('invalid login credentials')) return 'Credenciais inválidas. Confira e tente novamente.';
  if (msg.includes('invalid email')) return 'E-mail inválido.';
  if (msg.includes('password')) return 'Senha inválida.';
  return 'Não foi possível entrar. Tente novamente.';
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const form = await req.formData();
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');

  if (!email || !password) {
    return NextResponse.redirect(new URL('/auth/login?error=' + encodeURIComponent('Informe e-mail e senha.'), url), 303);
  }

  const supabase = supabaseRoute();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const pt = mapErrorToPtBr(error.message);
    return NextResponse.redirect(new URL('/auth/login?error=' + encodeURIComponent(pt), url), 303);
  }

  return NextResponse.redirect(new URL('/dashboard', url), 303);
}
