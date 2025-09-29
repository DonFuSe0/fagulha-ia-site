'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const supabase = supabaseClient();
  const router = useRouter();
  const qs = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState<string | null>(null);

  const next = qs.get('next') || '/dashboard';

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '').trim();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(next);
    } catch (err: any) {
      setError(err.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL!;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            prompt: 'consent',
            access_type: 'offline'
          }
        }
      });
      if (error) throw error;
      // o redirect acontece fora — nada a fazer aqui
    } catch (err: any) {
      setError(err.message || 'Falha ao iniciar login com Google');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {errorMsg && <p className="text-[var(--danger)] text-sm">{errorMsg}</p>}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded bg-[#1f6feb] px-4 py-2 text-white hover:opacity-90"
      >
        {loading ? 'Redirecionando…' : 'Entrar com Google'}
      </button>

      <div className="text-center text-sm text-[var(--muted)]">ou</div>

      <form onSubmit={handleEmail} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Seu e-mail"
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Sua senha"
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"
          required
        />
        <button disabled={loading} className="w-full rounded bg-[var(--primary)] px-4 py-2 text-white">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
