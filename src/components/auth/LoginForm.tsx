'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabaseClient from '@/lib/supabase/client';

export default function LoginForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const supabase = supabaseClient();

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMsg, setError] = useState<string | null>(sp.get('error'));
  const [infoMsg, setInfo] = useState<string | null>(sp.get('msg'));

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    setLoadingEmail(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message || 'Falha ao entrar.');
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setInfo(null);
    setLoadingGoogle(true);
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${base}/auth/callback?redirect=/dashboard`,
          queryParams: { prompt: 'select_account' },
        },
      });
      // Redireciona ao Google
    } catch (err: any) {
      setError(err?.message || 'Falha ao iniciar login com Google.');
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">
      <h1 className="mb-1 text-2xl font-semibold text-[var(--text)]">Bem-vindo</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Entre para acessar seu painel e gerar imagens.</p>

      {infoMsg && (
        <div className="mb-4 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-3 text-sm text-[var(--primary)]">
          {infoMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleGoogle}
        disabled={loadingGoogle}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white/90 px-4 py-2 font-medium text-[#1f1f1f] hover:bg-white disabled:opacity-60"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#4285F4] text-white text-xs">G</span>
        {loadingGoogle ? 'Conectando…' : 'Entrar com Google'}
      </button>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-[var(--border)]" />
        <span className="text-xs uppercase tracking-wider text-[var(--muted)]">ou</span>
        <div className="h-[1px] flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-3" autoComplete="on">
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--muted)]">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
            placeholder="voce@exemplo.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--muted)]">Senha</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
            placeholder="Sua senha"
          />
        </label>
        <button
          type="submit"
          disabled={loadingEmail}
          className="mt-1 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
        >
          {loadingEmail ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Não tem conta?{' '}
        <a href="/auth/sign-up" className="text-[var(--primary)] hover:underline">Cadastrar</a>
      </p>
    </div>
  );
}
