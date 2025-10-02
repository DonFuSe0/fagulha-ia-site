
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import ProfileHero from "@/app/_components/ProfileHero";
import TokensHistory from "@/app/_components/TokensHistory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <ProfileHero />
      <TokensHistory />
    </div>
  );
}
