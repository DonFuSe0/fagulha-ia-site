import { createServerClient } from "@/lib/supabase/server"
import { GalleryGrid } from "@/components/gallery-grid"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function PublicGalleryPage() {
  const supabase = createServerClient()

  let publicImages = []
  try {
    const { data } = await supabase
      .from("images")
      .select("*")
      .eq("is_public", true)
      .gt("public_expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(50)

    publicImages = data || []
  } catch (error) {
    console.log("[v0] Gallery page error:", error)
    publicImages = []
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <FagulhaLogo size="md" />
            </div>

            <div className="flex items-center gap-4">
              <Link href="/generate">
                <Button variant="outline" className="glass bg-transparent">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Criar Imagem
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-fagulha hover:opacity-90">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-fagulha">Galeria Pública</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubra criações incríveis da nossa comunidade. Inspire-se e crie suas próprias obras de arte com IA.
          </p>
        </div>

        <GalleryGrid images={publicImages} isPublic={true} />
      </main>
    </div>
  )
}
