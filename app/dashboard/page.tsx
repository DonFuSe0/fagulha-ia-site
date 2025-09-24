import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardQuickActions } from "@/components/dashboard-quick-actions"
import { ImageIcon, SparkleIcon } from "@/components/icons"
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
      {/* Sidebar */}
      <DashboardSidebar userTokens={mockUser.tokens} />

      {/* Main Content */}
      <div className="pl-64 transition-all duration-300">
        <div className="container mx-auto px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-fagulha/20 ring-2 ring-fagulha/10">
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

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
                <p className="text-xs text-muted-foreground">Última visita: {new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <DashboardStats tokens={mockUser.tokens} imagesCreated={recentImagesCount} accountStatus="active" />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
            <DashboardQuickActions />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-fagulha" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma imagem</p>
                  <Button asChild className="bg-fagulha hover:bg-fagulha/90">
                    <Link href="/generate">
                      <SparkleIcon className="mr-2 h-4 w-4" />
                      Criar sua primeira imagem
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SparkleIcon className="h-5 w-5 text-fagulha" />
                  Dicas e Inspiração
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-fagulha/5 border border-fagulha/10">
                    <h4 className="font-medium text-fagulha mb-2">💡 Dica do Dia</h4>
                    <p className="text-sm text-muted-foreground">
                      Use prompts detalhados para obter melhores resultados. Descreva o estilo, cores e composição
                      desejada.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-2">🎨 Tendências</h4>
                    <p className="text-sm text-muted-foreground">
                      Arte digital minimalista e retratos em estilo cyberpunk estão em alta esta semana.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
