import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryGrid from "@/components/gallery-grid";

export default async function MyGalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/my-gallery");
  }

  const { data, error } = await supabase
    .from("images")
    .select("id,image_url,prompt,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(48);

  const items = error ? [] : (data ?? []);

  return (
    <main className="container py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Minha galeria</h1>
        <p className="text-[var(--color-muted)]">Suas imagens geradas recentemente.</p>
      </header>

      <GalleryGrid items={items} />
    </main>
  );
}
