// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const { data: balanceRow } = await supabase
    .from("user_balances")
    .select("tokens")
    .eq("user_id", user.id)
    .maybeSingle();

  const tokens = balanceRow?.tokens ?? 0;

  return (
    <main className="container py-10 space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        Olá, {user.email}
      </h1>
      <p className="text-[var(--color-muted)]">
        Seu saldo atual: <span className="font-semibold">{tokens}</span> tokens.
      </p>

      <form action="/auth/logout" method="post">
        <button
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium"
          type="submit"
        >
          Sair
        </button>
      </form>
    </main>
  );
}
