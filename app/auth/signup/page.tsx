"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  // Turnstile widget will set a token in window.__turnstile_token (simple approach).
  // You must include the Turnstile script in the page <head> or layout:
  // <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  // And render: <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
  // Simpler approach below: we will programmatically execute the challenge (if available).

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    // Try to get token from widget if present:
    // Many integrations prefer executing grecaptcha-like API; adjust based on widget.
    const token = (window as any).__turnstile_token || undefined;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken: token })
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json?.error || "Erro no cadastro");
      } else {
        setMsg("Cadastro criado. Verifique seu e-mail para confirmar. Após confirmação, seus créditos serão liberados.");
        // Optionally redirect to login
        // router.push('/auth/login');
      }
    } catch (err) {
      console.error(err);
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

        {/* Add Turnstile container: load script in layout head and this div will render widget */}
        <div>
          <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
          <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
        </div>

        <button type="submit" className="px-4 py-2 bg-brand rounded" disabled={busy}>
          {busy ? 'Cadastrando...' : 'Criar conta'}
        </button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
