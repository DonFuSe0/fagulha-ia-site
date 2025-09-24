import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FagulhaLogo } from "@/components/fagulha-logo"
import Link from "next/link"

export default function DashboardPage() {
  // Mock user data for now
  const mockUser = {
    id: "1",
    email: "usuario@exemplo.com",
    display_name: "Usuário Teste",
    nickname: "@teste",
    tokens: 100,
    avatar_url: null,
    created_at: new Date().toISOString(),
  }

  const recentImagesCount = 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <FagulhaLogo size="md" />
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-fagulha/10 text-fagulha border-fagulha/20">
                <span className="mr-1">🪙</span>
                {mockUser.tokens} tokens
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">
                  <span>⚙️</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <span>🚪</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-fagulha/20">
              <AvatarImage src={mockUser.avatar_url || ""} alt={mockUser.display_name || ""} />
              <AvatarFallback className="bg-fagulha/10 text-fagulha text-lg font-semibold">
                {mockUser.display_name?.charAt(0) || mockUser.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                Olá, <span className="text-gradient-fagulha">{mockUser.display_name || "Usuário"}</span>!
              </h1>
              <p className="text-muted-foreground">
                {mockUser.nickname || "@usuario"} • Membro desde{" "}
                {new Date(mockUser.created_at || "").toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Disponíveis</CardTitle>
              <span className="text-fagulha">🪙</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fagulha">{mockUser.tokens}</div>
              <p className="text-xs text-muted-foreground">
                {mockUser.tokens > 0 ? "Pronto para criar!" : "Compre mais tokens"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Imagens Criadas</CardTitle>
              <span className="text-fagulha">🖼️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentImagesCount}</div>
              <p className="text-xs text-muted-foreground">Total de criações</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status da Conta</CardTitle>
              <span className="text-fagulha">✨</span>
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
              <span className="text-2xl">➕</span>
              <span>Criar Imagem</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-fagulha/20 hover:border-fagulha/40 bg-transparent">
            <Link href="/my-gallery" className="flex flex-col items-center gap-2">
              <span className="text-2xl">🖼️</span>
              <span>Minha Galeria</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-fagulha/20 hover:border-fagulha/40 bg-transparent">
            <Link href="/gallery" className="flex flex-col items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>Galeria Pública</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-fagulha/20 hover:border-fagulha/40 bg-transparent">
            <Link href="/pricing" className="flex flex-col items-center gap-2">
              <span className="text-2xl">🪙</span>
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
              <span className="text-6xl mb-4 block">🖼️</span>
              <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma imagem</p>
              <Button asChild className="bg-fagulha hover:bg-fagulha/90">
                <Link href="/generate">
                  <span className="mr-2">✨</span>
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
