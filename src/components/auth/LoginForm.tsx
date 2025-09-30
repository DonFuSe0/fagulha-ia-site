'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabaseBrowser from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const emailPrefill = search.get('email') || '';

  const [email, setEmail] = useState(emailPrefill);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErr(error.message || 'Falha ao entrar. Verifique seus dados.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro inesperado ao entrar.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
      <h1 className="mb-1 text-2xl font-semibold">Entrar</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Acesse sua conta com e-mail e senha
      </p>

      {err && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            autoComplete="current-password"
            placeholder="Sua senha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        Não tem conta?{' '}
        <a
          href="/auth/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Cadastrar
        </a>
      </div>
    </div>
  );
}
