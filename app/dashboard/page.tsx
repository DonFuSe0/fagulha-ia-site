
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import BalanceCard from "@/app/_components/BalanceCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Perfil</h1>
      <BalanceCard />
      {/* O histórico existente permanece, apenas garantimos que o SALDO vem de profiles.credits */}
    </div>
  );
}
