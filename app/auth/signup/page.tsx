"use client";

import { useEffect, useRef, useState } from "react";

declare global { interface Window { turnstile?: any; onTurnstile?: (token: string) => void; } }

export default function SignupPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // carrega script do Turnstile e renderiza com callback
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (window.turnstile) {
        const wid = window.turnstile.render('#cf-turnstile', {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            // nada a fazer aqui, vamos pegar o token on-demand no submit
          }
        });
        widgetIdRef.current = wid;
      }
    };
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    try {
      let token = '';
      if (window.turnstile && widgetIdRef.current) {
        token = window.turnstile.getResponse(widgetIdRef.current) || '';
      }
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken: token })
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json?.error || "Não é possível criar conta agora. Tente mais tarde.");
      } else {
        setMsg("Conta criada com sucesso! Enviamos um e-mail de confirmação. Após confirmar, seus créditos serão liberados.");
        (e.currentTarget.reset as any)?.();
      }
    } catch {
      setMsg("Erro interno. Tente novamente.");
    } finally {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">E-mail</span>
          <input name="email" type="email" required className="w-full p-2 rounded bg-gray-900" />
        </label>
        <label className="block">
          <span className="text-sm">Senha</span>
          <input name="password" type="password" required minLength={6} className="w-full p-2 rounded bg-gray-900" />
        </label>

        <div id="cf-turnstile" className="cf-turnstile" />

        <button type="submit" className="px-4 py-2 bg-brand rounded" disabled={busy}>
          {busy ? 'Cadastrando...' : 'Criar conta'}
        </button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
