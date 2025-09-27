"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);

    // importa o client **dinamicamente** para não quebrar no build
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    router.replace(next);
  }

  return (
    <main className="container max-w-md py-10">
      <h1 className="text-2xl font-bold mb-6">Entrar</h1>

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
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium disabled:opacity-60"
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {err && <p className="mt-4 text-sm text-red-500">{err}</p>}

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Não tem conta? <Link href="/auth/sign-up" className="underline">Criar</Link>
      </p>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <main className="container max-w-md py-10 animate-pulse">
      <div className="h-7 w-40 rounded bg-[var(--color-border)] mb-6" />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-[var(--color-border)]" />
          <div className="h-10 w-full rounded bg-[var(--color-border)]" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-[var(--color-border)]" />
          <div className="h-10 w-full rounded bg-[var(--color-border)]" />
        </div>
        <div className="h-10 w-full rounded bg-[var(--color-border)]" />
      </div>
      <div className="h-4 w-60 rounded bg-[var(--color-border)] mt-6" />
    </main>
  );
}
