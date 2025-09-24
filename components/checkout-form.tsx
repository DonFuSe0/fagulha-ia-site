"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { QrCode, CreditCard, Smartphone, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Plan {
  name: string
  price: number
  tokens: number
  color: string
}

interface UserProfile {
  display_name: string
  email: string
}

interface CheckoutFormProps {
  plan: Plan
  userProfile: UserProfile | null
}

export function CheckoutForm({ plan, userProfile }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("pix")
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<{
    qrCode: string
    pixKey: string
    paymentId: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("[v0] Creating payment:", { plan: plan.name, amount: plan.price })

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          amount: plan.price,
          tokens: plan.tokens,
          paymentMethod,
        }),
      })

      const data = await response.json()
      console.log("[v0] Payment response:", data)

      if (response.ok) {
        if (paymentMethod === "pix") {
          setPixData({
            qrCode: data.qrCode || "mock-qr-code",
            pixKey: data.pixKey || `pix-key-${Date.now()}`,
            paymentId: data.paymentId || `payment-${Date.now()}`,
          })
          toast.success("PIX gerado com sucesso!")
        } else {
          toast.success("Redirecionando para pagamento...")
          // Aqui seria redirecionamento para gateway de cartão
        }
      } else {
        console.error("[v0] Payment error:", data)
        toast.error(data.error || "Erro ao processar pagamento")
      }
    } catch (error) {
      console.error("[v0] Payment request failed:", error)
      toast.error("Erro ao processar pagamento")
    } finally {
      setLoading(false)
    }
  }

  const copyPixKey = async () => {
    if (pixData?.pixKey) {
      await navigator.clipboard.writeText(pixData.pixKey)
      setCopied(true)
      toast.success("Chave PIX copiada!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (pixData) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Escaneie o QR Code com seu app do banco</p>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">Ou copie a chave PIX:</Label>
            <div className="flex gap-2 mt-2">
              <Input value={pixData.pixKey} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="sm" onClick={copyPixKey} className="flex-shrink-0 bg-transparent">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Instruções:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o QR Code ou cole a chave</li>
              <li>Confirme o pagamento de R$ {plan.price.toFixed(2)}</li>
              <li>Seus tokens serão adicionados automaticamente</li>
            </ol>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">PIX expira em 30 minutos</p>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Método de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base font-medium">Escolha como pagar:</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
              <div className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:border-fagulha/50 transition-colors">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Smartphone className="h-4 w-4" />
                  <div>
                    <div className="font-medium">PIX</div>
                    <div className="text-sm text-muted-foreground">Aprovação instantânea</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:border-fagulha/50 transition-colors opacity-50">
                <RadioGroupItem value="card" id="card" disabled />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Cartão de Crédito</div>
                    <div className="text-sm text-muted-foreground">Em breve</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" defaultValue={userProfile?.display_name || ""} required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={userProfile?.email || ""} required />
            </div>
          </div>

          <Button type="submit" className="w-full bg-fagulha hover:bg-fagulha/90 glow-fagulha" disabled={loading}>
            {loading ? "Processando..." : `Pagar R$ ${plan.price.toFixed(2)}`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ao continuar, você concorda com nossos{" "}
            <a href="/terms" className="text-fagulha hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="/privacy" className="text-fagulha hover:underline">
              Política de Privacidade
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
