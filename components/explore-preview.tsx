import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GalleryGrid from "@/components/gallery-grid";

export default async function ExplorePreview() {
  const supabase = await createClient();

  // Busca pública: requer política RLS permitindo SELECT quando is_public = true (ver SQL abaixo)
  const { data, error } = await supabase
    .from("generations")
    .select("id,image_url,prompt,created_at,is_public")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(8);

  // Falha silenciosa → mostra esqueleto
  const items = error ? [] : (data ?? []);

  return (
    <section className="container py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Explorar criações</h2>
          <p className="text-[var(--color-muted)]">As publicações mais recentes da comunidade.</p>
        </div>
        <Link href="/explore" className="btn-ghost">
          Ver tudo
        </Link>
      </div>

      <GalleryGrid items={items} />
    </section>
  );
}
