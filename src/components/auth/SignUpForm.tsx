'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

/**
 * Formulário de cadastro por e-mail.
 * Fluxo:
 * 1) chama /api/check-signup para validar e-mail + IP
 * 2) supabase.auth.signUp
 * 3) redireciona para /auth/login com aviso para confirmar o e-mail
 */
export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState<string | undefined>();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '').trim();

    try {
      // 1) Validação server-side (e-mail duplicado + limite por IP)
      const check = await fetch('/api/check-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!check.ok) {
        const j = await check.json().catch(() => ({}));
        throw new Error(j.error || 'Cadastro não permitido.');
      }

      // 2) Criação de conta no Supabase
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (error) throw error;

      // 3) Sucesso — leva o usuário para a tela de login com aviso
      router.push('/auth/login?signup=success');
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar. Tente novamente.');
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
      {errorMsg && (
        <p className="text-[var(--danger)] text-sm">{errorMsg}</p>
      )}
      <button
        disabled={loading}
        className="rounded bg-[var(--primary)] px-4 py-2 text-white"
      >
        {loading ? 'Enviando...' : 'Criar conta'}
      </button>
    </form>
  );
}
