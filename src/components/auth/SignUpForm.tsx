// Caminho: src/components/auth/SignUpForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseClient from '@/lib/supabase/client';

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState<string | undefined>();
  const router = useRouter();
  const supabase = supabaseClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    try {
      // Checagem de pré-cadastro (e-mail/IP)
      const pre = await fetch('/api/check-signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!pre.ok) {
        const j = await pre.json().catch(() => ({}));
        throw new Error(j?.message || 'Não foi possível validar seu cadastro.');
      }

      // Cria usuário por e-mail/senha
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Redireciona para tela informando confirmação por e-mail
      router.replace('/auth/check-email');
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar sua conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="email"
        type="email"
        placeholder="Seu e-mail"
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Crie uma senha"
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"
        required
      />
      {errorMsg && <p className="text-[var(--danger)] text-sm">{errorMsg}</p>}
      <button
        disabled={loading}
        className="rounded bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Criar conta'}
      </button>
    </form>
  );
}
