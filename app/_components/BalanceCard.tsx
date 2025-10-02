
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BalanceCard() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .maybeSingle();

  const credits = profile?.credits ?? 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-neutral-400">Saldo atual</div>
      <div className="mt-1 text-3xl font-semibold text-white">
        {credits} <span className="text-sm font-normal text-neutral-400">tokens</span>
      </div>
    </div>
  );
}
