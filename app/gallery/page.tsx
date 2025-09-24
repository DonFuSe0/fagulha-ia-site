import { createClient } from "@/lib/supabase/server";
import GalleryGrid from "@/components/gallery-grid";

export const revalidate = 60; // cache leve

export default async function PublicGalleryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("images")
    .select("id,image_url,prompt,created_at,is_public")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(24);

  const items = error ? [] : (data ?? []);

  return (
    <main className="container py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Galeria pública</h1>
        <p className="text-[var(--color-muted)]">As criações mais recentes da comunidade.</p>
      </header>

      <GalleryGrid items={items} />
    </main>
  );
}
