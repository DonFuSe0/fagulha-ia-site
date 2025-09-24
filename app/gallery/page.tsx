import { createServerClient } from "@/lib/supabase/server"
import { GalleryGrid } from "@/components/gallery-grid"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PublicGalleryPage() {
  const supabase = createServerClient()

  // Buscar imagens públicas
  const { data: publicImages } = await supabase
    .from("images")
    .select("*")
    .eq("is_public", true)
    .gt("public_expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <FagulhaLogo className="h-8 w-8" />
              <span className="text-xl font-bold">Fagulha.ia</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/generate">
                <Button variant="outline">Criar Imagem</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Galeria Pública
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubra criações incríveis da nossa comunidade. Inspire-se e crie suas próprias obras de arte com IA.
          </p>
        </div>

        <GalleryGrid images={publicImages || []} isPublic={true} />
      </main>
    </div>
  )
}
