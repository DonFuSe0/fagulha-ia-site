import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ImageGenerationForm } from "@/components/image-generation-form"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Coins } from "lucide-react"
import Link from "next/link"

export default async function GeneratePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user profile for token balance
  const { data: profile } = await supabase.from("profiles").select("tokens").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <FagulhaLogo size="md" />
            </div>
            <h1 className="text-xl font-semibold">Gerar Imagem</h1>
            <Badge variant="secondary" className="bg-fagulha/10 text-fagulha border-fagulha/20">
              <Coins className="mr-1 h-3 w-3" />
              {profile?.tokens || 0} tokens
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Crie sua <span className="text-gradient-fagulha">obra-prima</span>
            </h1>
            <p className="text-muted-foreground">
              Descreva sua visão e nossa IA transformará suas palavras em arte digital extraordinária
            </p>
          </div>

          <ImageGenerationForm userTokens={profile?.tokens || 0} />
        </div>
      </div>
    </div>
  )
}
