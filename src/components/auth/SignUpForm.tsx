"use client";
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // First check if the email or IP is allowed to create a new account.
    try {
      const checkRes = await fetch('/api/check-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const checkJson = await checkRes.json();
      if (!checkRes.ok) {
        setLoading(false);
        setError(checkJson.error || 'Não foi possível criar conta.');
        return;
      }
    } catch (err) {
      console.error('Erro ao verificar cadastro', err);
      setLoading(false);
      setError('Erro ao validar dados. Tente novamente.');
      return;
    }
    const supabase = supabaseBrowser();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname
        }
      }
    });
    setLoading(false);
    if (signUpError) {
      // Se o Supabase retornar que o usuário já existe, traduzimos a mensagem.
      const errMsg =
        signUpError.message?.toLowerCase().includes('registered')
          ? 'Este e‑mail já está cadastrado.'
          : signUpError.message;
      setError(errMsg);
    } else {
      // Tenta capturar o endereço IP e associá-lo ao perfil
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (user && ip) {
          await fetch('/api/set-ip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, ip })
          });
        }
      } catch (err) {
        // Falha silenciosa ao obter ou salvar IP
        console.warn('Não foi possível registrar o IP', err);
      }
      // Redireciona para tela de login com aviso de verificação
      router.push('/auth/login?verify=1');
    }
  };
  const handleGoogleSignIn = async () => {
    const supabase = supabaseBrowser();
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
          required
        />
      </div>
      <div>
        <label className="block mb-1 text-sm" htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
          required
        />
      </div>
      <div>
        <label className="block mb-1 text-sm" htmlFor="nickname">Apelido (opcional)</label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
        />
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="btn-ghost w-full mt-2"
      >
        Criar conta com Google
      </button>
    </form>
  );
}
