'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseBrowser from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    try {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_SITE_URL!;
      const redirectTo = `${base.replace(/\/$/, '')}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo } // ⚠️ Sempre via /auth/callback
      });

      if (error) throw error;
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Falha ao iniciar login com Google.');
      setLoading(false);
    }
  }

  async function signInWithEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/dashboard');
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao validar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-6 rounded-2xl border bg-white/60 shadow">
      <h1 className="text-2xl font-semibold text-gray-900">Entrar</h1>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        {loading ? 'Conectando…' : 'Entrar com Google'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      <form onSubmit={signInWithEmail} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-700">E-mail</label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Senha</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/85"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
