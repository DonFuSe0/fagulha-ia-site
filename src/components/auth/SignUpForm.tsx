'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

export default function SignUpForm() {
  const supabase = supabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1) Checagem de e-mail e IP no backend
      const checkRes = await fetch('/api/check-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!checkRes.ok) {
        const payload = await checkRes.json().catch(() => ({}));
        throw new Error(payload?.message || 'Cadastro bloqueado');
      }

      // 2) Cria a conta com verificação de e-mail
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`
        }
      });
      if (error) throw error;

      // 3) Redireciona para a tela de login com aviso de confirmação
      router.push('/auth/login?success=1');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao validar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {errorMsg && <p className="text-danger text-sm">{errorMsg}</p>}
      <div className="space-y-1">
        <label className="block text-sm">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-surface border border-border px-3 py-2"
          placeholder="seu@email.com"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-surface border border-border px-3 py-2"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Criando...' : 'Criar conta'}
      </button>
    </form>
  );
}
