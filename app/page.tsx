import { FagulhaLogo } from "@/components/fagulha-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Users, ArrowRight, Check } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <FagulhaLogo size="md" />
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                Galeria
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </Link>
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </Link>
              <Link href="/social" className="text-muted-foreground hover:text-foreground transition-colors">
                Social
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-gradient-fagulha hover:opacity-90 glow-fagulha-sm">
                <Link href="/auth/sign-up">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-fagulha-primary/5 via-transparent to-fagulha-secondary/5" />

        <div className="container mx-auto text-center relative">
          <div className="max-w-6xl mx-auto">
            <Badge variant="secondary" className="mb-8 glass">
              <Sparkles className="mr-2 h-4 w-4" />
              Plataforma de IA mais avançada do Brasil
            </Badge>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 text-balance leading-tight">
              Crie arte digital
              <br />
              <span className="text-gradient-fagulha">extraordinária</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-4xl mx-auto leading-relaxed">
              Transforme suas ideias em obras de arte incríveis com nossa tecnologia de IA de última geração. Rápido,
              intuitivo e poderoso.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Button size="lg" asChild className="bg-gradient-fagulha hover:opacity-90 glow-fagulha text-lg px-8 py-4">
                <Link href="/auth/sign-up">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Começar Gratuitamente
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 glass bg-transparent">
                <Link href="/gallery">
                  Ver Galeria
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-5xl font-bold text-gradient-fagulha mb-3 animate-glow">20</div>
                <div className="text-muted-foreground text-lg">Tokens Grátis</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gradient-fagulha mb-3 animate-glow">∞</div>
                <div className="text-muted-foreground text-lg">Possibilidades</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gradient-fagulha mb-3 animate-glow">24h</div>
                <div className="text-muted-foreground text-lg">Suporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Recursos <span className="text-gradient-fagulha">Poderosos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ferramentas avançadas para dar vida às suas ideias criativas com tecnologia de última geração
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass hover:glow-fagulha-sm transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-fagulha flex items-center justify-center mb-4 group-hover:animate-float">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Geração Ultrarrápida</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Crie imagens de alta qualidade em segundos com nossa infraestrutura otimizada e modelos de IA
                  avançados
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:glow-fagulha-sm transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-fagulha flex items-center justify-center mb-4 group-hover:animate-float">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Estilos Infinitos</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Explore uma vasta gama de estilos artísticos e modelos especializados para cada tipo de criação
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:glow-fagulha-sm transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-fagulha flex items-center justify-center mb-4 group-hover:animate-float">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Comunidade Criativa</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compartilhe suas criações e inspire-se com trabalhos incríveis de outros artistas da comunidade
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-32 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Comece <span className="text-gradient-fagulha">gratuitamente</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              20 tokens grátis para você experimentar todo o poder da nossa plataforma
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="glass p-8 rounded-2xl">
                <div className="text-3xl font-bold text-gradient-fagulha mb-2">Grátis</div>
                <div className="text-muted-foreground mb-4">20 tokens</div>
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Modelos básicos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Resolução padrão
                  </li>
                </ul>
              </div>

              <div className="glass p-8 rounded-2xl ring-2 ring-fagulha-primary/20 relative">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-fagulha">
                  Mais Popular
                </Badge>
                <div className="text-3xl font-bold text-gradient-fagulha mb-2">R$ 39,99</div>
                <div className="text-muted-foreground mb-4">200 tokens</div>
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Todos os modelos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Alta resolução
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Configurações avançadas
                  </li>
                </ul>
              </div>

              <div className="glass p-8 rounded-2xl">
                <div className="text-3xl font-bold text-gradient-fagulha mb-2">R$ 99,99</div>
                <div className="text-muted-foreground mb-4">600 tokens</div>
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Modelos premium
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Máxima resolução
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Suporte prioritário
                  </li>
                </ul>
              </div>
            </div>

            <Button size="lg" asChild className="bg-gradient-fagulha hover:opacity-90 glow-fagulha text-lg px-8 py-4">
              <Link href="/pricing">
                Ver Todos os Planos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto glass p-16 rounded-3xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Pronto para criar algo <span className="text-gradient-fagulha">extraordinário</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Junte-se a milhares de artistas que já estão criando obras incríveis com Fagulha.ia
            </p>
            <Button size="lg" asChild className="bg-gradient-fagulha hover:opacity-90 glow-fagulha text-lg px-8 py-4">
              <Link href="/auth/sign-up">
                <Sparkles className="mr-2 h-5 w-5" />
                Começar Agora - É Grátis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <FagulhaLogo size="md" />
            <div className="flex items-center gap-8 mt-4 md:mt-0">
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
          <div className="pt-8 border-t border-border/50 text-center text-muted-foreground">
            <p>&copy; 2025 Fagulha.ia. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
