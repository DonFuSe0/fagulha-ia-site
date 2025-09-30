"use client";

import { useEffect, useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (window as any).onTurnstile = (token: string) => {
      (window as any).__turnstile_token = token;
    };
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const token = (window as any).__turnstile_token;
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken: token })
      });
      const json = await res.json();
      if (!res.ok) setMsg(json?.error || "Erro no cadastro");
      else setMsg("Cadastro criado. Verifique seu e-mail para confirmar. Após confirmar, seus créditos serão liberados.");
    } catch {
      setMsg("Erro interno");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">Email</span>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full p-2 rounded bg-gray-900" />
        </label>
        <label className="block">
          <span className="text-sm">Senha</span>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={6} className="w-full p-2 rounded bg-gray-900" />
        </label>

        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="onTurnstile"
        ></div>

        <button type="submit" className="px-4 py-2 bg-brand rounded" disabled={busy}>
          {busy ? 'Cadastrando...' : 'Criar conta'}
        </button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
