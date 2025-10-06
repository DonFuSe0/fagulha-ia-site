import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import GalleryCard from "../components/gallery/GalleryCard";
import Header from "@/components/Header"

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyGalleryPage() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("generations")
    .select("id, image_url, thumb_url, is_public, public_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <Header />
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-white">Minha galeria</h1>
      {error && (
        <div className="rounded-lg border border-red-900/40 bg-red-900/20 p-3 text-red-300">
          Erro ao carregar: {error.message}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {(data || []).map((g: any) => (
          <GalleryCard
            key={g.id}
            id={g.id}
            imageUrl={g.image_url}
            thumbUrl={g.thumb_url}
            isPublic={g.is_public}
            publicAt={g.public_at}
            createdAt={g.created_at}
            onToggled={() => { if (typeof window !== "undefined") window.location.reload(); }}
            showPublicTimer={true}
          />
        ))}
      </div>
    </div>
  );
}