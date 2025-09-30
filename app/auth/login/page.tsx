"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browserClient';

/**
 * Tela de login. Permite autenticar um usuário existente com e‑mail e senha.
 * Após o login, redireciona para o dashboard. Caso falhe, mostra o erro.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: loginError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <h2 className="mb-6 text-center text-3xl font-bold text-white">Entrar</h2>
      {error && (
        <div className="mb-4 rounded border border-red-500 bg-red-900/60 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-gray-300">
            E‑mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-gray-700 bg-background px-3 py-2 text-gray-200 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-gray-300">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-700 bg-background px-3 py-2 text-gray-200 focus:border-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand px-4 py-2 font-medium text-black transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-400">
        Ainda não tem conta?{' '}
        <a href="/auth/signup" className="text-brand hover:underline">
          Criar conta
        </a>
      </p>
    </div>
  );
}