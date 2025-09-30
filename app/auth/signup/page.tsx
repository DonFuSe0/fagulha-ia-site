"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browserClient';

/**
 * Tela de cadastro. Permite criar uma conta usando e‑mail e senha. Ao cadastrar
 * o usuário com sucesso, redireciona para o dashboard. Em caso de erro,
 * exibe uma mensagem na tela.
 */
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // Supabase envia um link de verificação por e‑mail quando a opção de email
    // confirmation está habilitada. Redirecionamos para o dashboard após
    // cadastrar para uma experiência mais fluida.
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-md py-10">
      <h2 className="mb-6 text-center text-3xl font-bold text-white">Criar conta</h2>
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
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-400">
        Já possui conta?{' '}
        <a href="/auth/login" className="text-brand hover:underline">
          Entrar
        </a>
      </p>
    </div>
  );
}