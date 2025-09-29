'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseClient from '@/lib/supabase/client';

export default function SignUpForm() {
  const supabase = supabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');

    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${base}/auth/callback?type=signup`, // importante!
        },
      });

      if (error) throw new Error(error.message);

      setMsg('Enviamos um link de confirmação para o seu e-mail.');
      // opcional: ir para tela de "verifique seu e-mail"
      router.replace('/auth/check-email');
    } catch (e: any) {
      setErr(e?.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {msg && (
        <div className="rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-3 text-sm text-[var(--primary)]">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">
          {err}
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm text-[var(--muted)]">E-mail</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
          placeholder="voce@exemplo.com"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-[var(--muted)]">Senha</span>
        <input
          name="password"
          type="password"
          minLength={6}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
          placeholder="Mínimo 6 caracteres"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white hover:bg-[var(--primary-600)] disabled:opacity-60"
      >
        {loading ? 'Cadastrando…' : 'Criar conta'}
      </button>
    </form>
  );
}
