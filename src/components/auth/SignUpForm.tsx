'use client';

import { useState } from 'react';
import supabaseBrowser from '@/lib/supabase/client';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');

  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    setLoading(true);

    try {
      const supabase = supabaseBrowser();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redireciona a confirmação para nosso callback
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
          data: {
            name: nome || null,
            nickname: apelido || null,
          },
        },
      });

      if (error) {
        setErr(error.message || 'Erro ao cadastrar. Tente novamente.');
        setLoading(false);
        return;
      }

      setOkMsg(
        'Cadastro criado! Verifique seu e-mail para confirmar e concluir o acesso.'
      );
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || 'Erro inesperado ao cadastrar.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
      <h1 className="mb-1 text-2xl font-semibold">Criar conta</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Cadastre-se com e-mail e senha
      </p>

      {err && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {okMsg && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
          {okMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            autoComplete="name"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Apelido</label>
          <input
            type="text"
            value={apelido}
            onChange={e => setApelido(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            autoComplete="nickname"
            placeholder="Como você quer ser visto"
          />
        </div>

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
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        Já tem conta?{' '}
        <a
          href="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </a>
      </div>
    </div>
  );
}
