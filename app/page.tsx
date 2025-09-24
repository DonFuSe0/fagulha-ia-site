import { FagulhaLogo } from "@/components/fagulha-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <FagulhaLogo size="md" />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </Link>
              <Link href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                Galeria
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-fagulha hover:bg-fagulha/90 glow-fagulha">
                <Link href="/auth/sign-up">Começar Grátis →</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 text-balance leading-tight">
              Transforme suas <span className="text-gradient-fagulha">ideias</span> em arte digital
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
              A plataforma mais avançada de geração de imagens por IA do Brasil. Crie obras de arte extraordinárias em
              segundos com nossa tecnologia de ponta.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button size="lg" asChild className="bg-fagulha hover:bg-fagulha/90 glow-fagulha text-lg px-8 py-4">
                <Link href="/auth/sign-up">✨ Começar Gratuitamente</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 bg-transparent">
                <Link href="#gallery">Ver Galeria →</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-fagulha mb-3 glow-fagulha">20</div>
                <div className="text-muted-foreground text-lg">Tokens Grátis</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-fagulha mb-3 glow-fagulha">∞</div>
                <div className="text-muted-foreground text-lg">Possibilidades</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-fagulha mb-3 glow-fagulha">24h</div>
                <div className="text-muted-foreground text-lg">Suporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-balance">
              Recursos <span className="text-gradient-fagulha">Poderosos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ferramentas avançadas para dar vida às suas ideias criativas com tecnologia de última geração
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-fagulha/50 transition-all duration-300 hover:glow-fagulha/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="text-5xl text-fagulha">⚡</div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Geração Rápida</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Crie imagens de alta qualidade em segundos com nossa tecnologia otimizada e servidores dedicados
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-fagulha/50 transition-all duration-300 hover:glow-fagulha/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="text-5xl text-fagulha">🎨</div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Estilos Diversos</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Escolha entre diversos estilos artísticos e modelos de IA especializados para cada tipo de criação
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-fagulha/50 transition-all duration-300 hover:glow-fagulha/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="text-5xl text-fagulha">👥</div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Galeria Pública</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compartilhe suas criações e inspire-se com trabalhos de outros artistas da comunidade
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-balance">
              Pronto para criar algo <span className="text-gradient-fagulha">extraordinário</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Junte-se a milhares de artistas que já estão criando obras incríveis com Fagulha.ia
            </p>
            <Button size="lg" asChild className="bg-fagulha hover:bg-fagulha/90 glow-fagulha text-lg px-8 py-4">
              <Link href="/auth/sign-up">✨ Começar Agora - É Grátis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <FagulhaLogo size="sm" />
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-muted-foreground">
            <p>&copy; 2025 Fagulha.ia. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
