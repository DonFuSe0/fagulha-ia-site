'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabaseClient from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(() => {
    const err = searchParams.get('auth_error');
    return err ? `Falha na autenticação: ${err}` : null;
  });

  const gotoDashboard = () => {
    router.replace('/dashboard');
    router.refresh();
  };

  const loginWithGoogle = async () => {
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
      // o fluxo redireciona para o Google; não há nada a fazer aqui
    } catch (e: any) {
      setMsg(e?.message ?? 'Erro ao entrar com Google');
      setBusy(false);
    }
  };

  const loginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      gotoDashboard();
    } catch (e: any) {
      setMsg(e?.message ?? 'Credenciais inválidas.');
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
      <h1 className="text-2xl font-semibold text-[var(--text)] mb-4">Entrar</h1>

      {msg && (
        <div className="mb-4 text-sm text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] rounded px-3 py-2">
          {msg}
        </div>
      )}

      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={busy}
        className="w-full mb-4 py-2 rounded-xl border border-[var(--border)] hover:bg-[color-mix(in_oklab,var(--border)_25%,transparent)]"
      >
        Entrar com Google
      </button>

      <div className="h-px bg-[var(--border)] my-4" />

      <form onSubmit={loginWithEmail} className="space-y-3">
        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white"
        >
          Entrar
        </button>
      </form>

      <p className="text-xs text-[var(--muted)] mt-4">
        Não tem conta? <a href="/auth/sign-up" className="underline">Cadastre-se</a>
      </p>
    </div>
  );
}
