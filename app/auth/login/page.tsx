// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // logged in: go to dashboard or perfil
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Entrar</h1>
        <form onSubmit={onSubmit} className="space-y-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center text-sm text-zinc-400">
            Não tem conta? <a className="text-orange-400 hover:underline" href="/auth/signup">Criar conta</a>
          </div>
        </form>
      </div>
    </div>
  );
}
