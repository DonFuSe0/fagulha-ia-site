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
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname
        }
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Supabase sends a confirmation email.  Redirect to login.
      router.push('/auth/login');
    }
  };
  const handleGoogleSignIn = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({ provider: 'google' });
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