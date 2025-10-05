import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 401 });

    return NextResponse.json({ ok: true, user: data.user });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Erro inesperado.' }, { status: 500 });
  }
}
