
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecentGenerations() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: gens } = await supabase
    .from("generations")
    .select("id, created_at, thumbnail_url, image_url, visibility")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const items = gens ?? [];

  return (
    <section className="space-y-3">
      <h2 className="text-base font-medium text-white/90">Minhas gerações recentes</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((g) => {
          const src = g.thumbnail_url || g.image_url;
          if (!src) return null;
          return (
            <Link key={g.id} href="/gallery" className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <div className="relative aspect-square">
                <Image
                  src={src}
                  alt="geração"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                />
              </div>
            </Link>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full text-sm text-white/60">Você ainda não tem criações recentes.</div>
        )}
      </div>
    </section>
  );
}
