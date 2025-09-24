import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GalleryGrid } from "@/components/gallery-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function MyGalleryPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Buscar imagens do usuário
  const { data: userImages } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Minha Galeria</h1>
            <p className="text-muted-foreground">
              Gerencie suas criações. Lembre-se: imagens expiram em 24h se não forem tornadas públicas.
            </p>
          </div>

          <Link href="/generate">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Imagem
            </Button>
          </Link>
        </div>

        <GalleryGrid images={userImages || []} isPublic={false} />
      </div>
    </div>
  )
}
