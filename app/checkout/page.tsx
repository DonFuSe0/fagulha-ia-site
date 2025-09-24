import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/checkout-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { ArrowLeft, Shield, Clock, CreditCard } from "lucide-react"
import Link from "next/link"

const plans = {
  fagulha: {
    name: "Fagulha",
    price: 9.99,
    tokens: 50,
    color: "text-orange-500",
  },
  chama: {
    name: "Chama",
    price: 39.99,
    tokens: 200,
    color: "text-fagulha",
  },
  incendio: {
    name: "Incêndio",
    price: 99.99,
    tokens: 600,
    color: "text-yellow-500",
  },
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string }
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const planKey = searchParams.plan as keyof typeof plans
  const selectedPlan = plans[planKey]

  if (!selectedPlan) {
    redirect("/pricing")
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/pricing">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <FagulhaLogo size="md" />
            </div>
            <h1 className="text-xl font-semibold">Finalizar Compra</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo do Pedido */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Plano {selectedPlan.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedPlan.tokens} tokens</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-fagulha">R$ {selectedPlan.price.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-fagulha">R$ {selectedPlan.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">O que você receberá:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• {selectedPlan.tokens} tokens para geração de imagens</li>
                      <li>• Tokens não expiram</li>
                      <li>• Acesso a todos os modelos disponíveis</li>
                      <li>• Suporte técnico</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Informações de Segurança */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Pagamento Seguro</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>PIX expira em 30 minutos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Seus dados estão protegidos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Checkout */}
            <div>
              <CheckoutForm plan={selectedPlan} userProfile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
