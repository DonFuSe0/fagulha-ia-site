import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Coins, ImageIcon, Settings, LogOut, Plus, Battery as Gallery, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's recent images count (we'll implement this later)
  const recentImagesCount = 0

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <FagulhaLogo size="md" />
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-fagulha/10 text-fagulha border-fagulha/20">
                <Coins className="mr-1 h-3 w-3" />
                {profile?.tokens || 0} tokens
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <form action={handleSignOut}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-fagulha/20">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.display_name || ""} />
              <AvatarFallback className="bg-fagulha/10 text-fagulha text-lg font-semibold">
                {profile?.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                Olá, <span className="text-gradient-fagulha">{profile?.display_name || "Usuário"}</span>!
              </h1>
              <p className="text-muted-foreground">
                @{profile?.nickname || "usuario"} • Membro desde{" "}
                {new Date(profile?.created_at || "").toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Disponíveis</CardTitle>
              <Coins className="h-4 w-4 text-fagulha" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fagulha">{profile?.tokens || 0}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.tokens && profile.tokens > 0 ? "Pronto para criar!" : "Compre mais tokens"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Imagens Criadas</CardTitle>
              <ImageIcon className="h-4 w-4 text-fagulha" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentImagesCount}</div>
              <p className="text-xs text-muted-foreground">Total de criações</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status da Conta</CardTitle>
              <Sparkles className="h-4 w-4 text-fagulha" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Ativa</div>
              <p className="text-xs text-muted-foreground">Conta verificada</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-24 bg-fagulha hover:bg-fagulha/90 glow-fagulha">
            <Link href="/generate" className="flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span>Criar Imagem</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-fagulha/20 hover:border-fagulha/40 bg-transparent">
            <Link href="/my-gallery" className="flex flex-col items-center gap-2">
              <Gallery className="h-6 w-6" />
              <span>Minha Galeria</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-fagulha/20 hover:border-fagulha/40 bg-transparent">
            <Link href="/gallery" className="flex flex-col items-center gap-2">
              <ImageIcon className="h-6 w-6" />
              <span>Galeria Pública</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-fagulha/20 hover:border-fagulha/40 bg-transparent">
            <Link href="/pricing" className="flex flex-col items-center gap-2">
              <Coins className="h-6 w-6" />
              <span>Comprar Tokens</span>
            </Link>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma imagem</p>
              <Button asChild className="bg-fagulha hover:bg-fagulha/90">
                <Link href="/generate">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Criar sua primeira imagem
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
