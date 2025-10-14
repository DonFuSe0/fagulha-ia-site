// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${siteUrl}/auth/callback` },
      });
      if (error) throw error;
      setOk('Verifique seu e-mail para confirmar a conta.');
      // opcional: redirecionar para /confirmar-email
      // router.push('/auth/confirmar-email');
    } catch (err: any) {
      setError(err?.message ?? 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Gradiente animado de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-move">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-30 animate-pulse"
          style={{background: 'radial-gradient(ellipse at 60% 40%, #ff7a18 0%, #ffb347 40%, #ff7a18 70%, transparent 100%)'}} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-2xl opacity-20 animate-spin-slow"
          style={{background: 'radial-gradient(ellipse at 80% 80%, #818cf8 0%, #0f172a 70%)'}} />
      </div>
      <div className="w-full max-w-md">
  <h1 className="text-3xl font-bold text-center mb-6 drop-shadow-[0_2px_16px_rgba(255,122,24,0.18)]">Criar conta</h1>
        <form onSubmit={onSubmit} className="space-y-4 bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 shadow-xl shadow-black/30 backdrop-blur">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-zinc-500 transition-all duration-200"
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-zinc-500 transition-all duration-200"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Confirmar senha</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-zinc-500 transition-all duration-200"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          {error && <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg animate-pulse mt-2">{error}</div>}
          {ok && <div className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900 px-3 py-2 rounded-lg animate-pulse mt-2">{ok}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium shadow-lg shadow-orange-900/20"
          >
            {loading ? 'Enviando...' : 'Criar conta'}
          </button>
          <div className="text-center text-sm text-zinc-400">
            Já tem conta? <a className="text-orange-400 hover:underline" href="/auth/login">Entrar</a>
          </div>
        </form>
      </div>
      {/* Animations CSS */}
      <style jsx global>{`
        @keyframes gradient-move {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.04); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-gradient-move > div:first-child {
          animation: gradient-move 8s ease-in-out infinite;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 24s linear infinite;
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 8px #ff7a18, 0 0 24px #ffb347; }
          50% { text-shadow: 0 0 24px #ffb347, 0 0 48px #ff7a18; }
        }
        .animate-text-glow {
          animation: text-glow 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
