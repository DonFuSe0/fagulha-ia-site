'use client';

import { useState } from 'react';
import Link from 'next/link';

type SignupForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);

    if (form.password !== form.confirmPassword) {
      setLoading(false);
      return setError('As senhas não conferem.');
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Não foi possível criar sua conta.');
      setOk('Conta criada! Verifique seu email para confirmar.');
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="text-sm text-white/60 mt-1">Cadastre-se para começar a usar.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirmar senha</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {ok && <p className="text-sm text-emerald-400">{ok}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 font-medium transition-colors"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/70">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 underline underline-offset-4">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
