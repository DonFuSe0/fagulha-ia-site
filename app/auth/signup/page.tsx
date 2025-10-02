"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // permite ajustar via env; default 6
  const minLen = Number(process.env.NEXT_PUBLIC_MIN_PASSWORD_LENGTH ?? 6);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < minLen) {
      setError(`A senha deve ter pelo menos ${minLen} caracteres.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });

      // em dev volta JSON; em prod pode redirecionar
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (!data.ok) {
          setError(
            data.error === "email_already_registered"
              ? "Este e-mail já está cadastrado."
              : data.error === "weak_password"
              ? `A senha deve ter pelo menos ${minLen} caracteres.`
              : "Não foi possível criar sua conta."
          );
        } else {
          window.location.href = "/auth/confirmar-email";
        }
      } else if (res.ok) {
        window.location.href = "/auth/confirmar-email";
      } else {
        setError("Não foi possível criar sua conta.");
      }
    } catch {
      setError("Falha de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Criar conta</h1>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-900/20 px-3 py-2 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 outline-none focus:border-white/30"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">
            Senha <span className="text-white/40 text-xs">(mín. {minLen})</span>
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 outline-none focus:border-white/30"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">Apelido (opcional)</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_]+"
            className="rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 outline-none focus:border-white/30"
          />
          <span className="text-xs text-white/40">
            3–20 caracteres (letras, números ou underline)
          </span>
        </label>

        <button
          disabled={loading}
          className="mt-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/15 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
