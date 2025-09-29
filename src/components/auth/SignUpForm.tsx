'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState<string|undefined>();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');

    try {
      // 1) verificação prévia (e-mail + IP)
      const res = await fetch('/api/check-signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Erro ao validar dados.');
        setLoading(false);
        return;
      }

      // 2) signUp com redirect absoluto para o seu domínio
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
      const supabase = supabaseClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?redirect=/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // 3) direciona para a página de aviso
      router.push('/auth/check-email');
    } catch {
      setError('Erro ao validar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="email" type="email" placeholder="Seu e-mail" className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]" required />
      <input name="password" type="password" placeholder="Crie uma senha" className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]" required />
      {errorMsg && <p className="text-[var(--danger)] text-sm">{errorMsg}</p>}
      <button disabled={loading} className="rounded bg-[var(--primary)] px-4 py-2 text-white">
        {loading ? 'Enviando...' : 'Criar conta'}
      </button>
    </form>
  );
}
