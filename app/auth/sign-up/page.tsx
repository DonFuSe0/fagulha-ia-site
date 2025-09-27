"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);

    // ⬇️ importa o client só na ação (evita avaliação no build)
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const redirectTo =
      `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg("Enviamos um link de confirmação. Verifique sua caixa de entrada e spam.");
  }

  return (
    <main className="container max-w-md py-10">
      <h1 className="text-2xl font-bold mb-6">Criar conta</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm">E-mail</label>
          <input
            type="email"
            className="w-full rounded-md border bg-transparent px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Senha</label>
          <input
            type="password"
            className="w-full rounded-md border bg-transparent px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium disabled:opacity-60"
        >
          {busy ? "Criando..." : "Criar conta"}
        </button>
      </form>

      {msg && <p className="mt-4 text-sm text-green-500">{msg}</p>}
      {err && <p className="mt-4 text-sm text-red-500">{err}</p>}

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Já tem conta? <Link href="/auth/login" className="underline">Entrar</Link>
      </p>
    </main>
  );
}
