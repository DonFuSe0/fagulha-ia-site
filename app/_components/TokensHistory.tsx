
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TokensHistory() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase
    .from("tokens")
    .select("id, amount, description, created_at, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-sm font-medium text-white/90">Histórico de tokens</div>
      <div className="grid gap-2">
        {(items ?? []).map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-3 py-2">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-white/90">{t.description ?? "Movimentação"}</span>
              <span className="text-xs text-white/50">
                {new Date(t.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
              </span>
            </div>
            <div className={`text-sm font-semibold ${t.amount >= 0 ? "text-emerald-300" : "text-red-300"}`}>
              {t.amount >= 0 ? "+" : ""}{t.amount}
            </div>
          </div>
        ))}
        {(items ?? []).length === 0 && (
          <div className="text-sm text-white/60">Sem movimentações.</div>
        )}
      </div>
    </div>
  );
}
