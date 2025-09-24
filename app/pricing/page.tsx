import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Check, Flame, Zap, Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Fagulha",
    price: "R$ 9,99",
    tokens: 50,
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    features: [
      "50 tokens para geração",
      "Modelos padrão",
      "Resoluções até 768x768",
      "Galeria privada",
      "Suporte por email",
    ],
  },
  {
    name: "Chama",
    price: "R$ 39,99",
    tokens: 200,
    icon: Zap,
    color: "text-fagulha",
    bgColor: "bg-fagulha/10",
    borderColor: "border-fagulha/20",
    popular: true,
    features: [
      "200 tokens para geração",
      "Todos os modelos",
      "Resoluções até 1024x1024",
      "Galeria privada e pública",
      "Configurações avançadas",
      "Suporte prioritário",
    ],
  },
  {
    name: "Incêndio",
    price: "R$ 99,99",
    tokens: 600,
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    features: [
      "600 tokens para geração",
      "Modelos premium exclusivos",
      "Todas as resoluções",
      "Galeria privada e pública",
      "Todas as configurações avançadas",
      "Suporte prioritário 24/7",
      "Acesso antecipado a novos recursos",
    ],
  },
]

export default function PricingPage() {
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
            <h1 className="text-xl font-semibold">Planos e Preços</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Escolha seu <span className="text-gradient-fagulha">plano</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Libere todo o potencial da criação com IA. Escolha o plano que melhor se adapta às suas necessidades
            criativas.
          </p>

          {/* Token Calculator Info */}
          <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Como funcionam os tokens?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-fagulha mb-2">1-2</div>
                <div className="text-muted-foreground">Tokens por imagem básica (512x512)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fagulha mb-2">2-4</div>
                <div className="text-muted-foreground">Tokens por imagem HD (1024x1024)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fagulha mb-2">3-6</div>
                <div className="text-muted-foreground">Tokens por imagem premium com configurações avançadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.name}
                className={`relative border-border/50 bg-card/50 backdrop-blur-sm hover:border-fagulha/50 transition-all duration-300 ${
                  plan.popular ? "ring-2 ring-fagulha/20 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-fagulha text-white">
                    Mais Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${plan.bgColor} ${plan.borderColor} border-2`}
                  >
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-fagulha">{plan.price}</div>
                  <div className="text-muted-foreground">{plan.tokens} tokens</div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular ? "bg-fagulha hover:bg-fagulha/90 glow-fagulha" : "bg-fagulha/80 hover:bg-fagulha"
                    }`}
                    asChild
                  >
                    <Link href={`/checkout?plan=${plan.name.toLowerCase()}`}>Escolher {plan.name}</Link>
                  </Button>

                  <div className="text-center text-xs text-muted-foreground">
                    Aproximadamente {Math.floor(plan.tokens / 2)} a {plan.tokens} imagens
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perguntas <span className="text-gradient-fagulha">Frequentes</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Os tokens expiram?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Não! Seus tokens não expiram. Você pode usá-los quando quiser, no seu próprio ritmo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Posso mudar de plano?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim! Você pode comprar tokens adicionais a qualquer momento. Os tokens se acumulam no seu saldo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o custo por imagem?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  O custo varia conforme a resolução, modelo e configurações avançadas. Você sempre vê o custo antes de
                  gerar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Há reembolso?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Oferecemos reembolso em até 7 dias para tokens não utilizados. Entre em contato conosco.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-4">
            Ainda tem <span className="text-gradient-fagulha">dúvidas</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Nossa equipe está aqui para ajudar você a escolher o melhor plano
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">Falar com Suporte</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
