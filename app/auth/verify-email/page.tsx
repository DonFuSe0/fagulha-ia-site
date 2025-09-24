import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="text-center">
            <FagulhaLogo size="lg" className="justify-center mb-2" />
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fagulha/10">
                <Mail className="h-8 w-8 text-fagulha" />
              </div>
              <CardTitle className="text-2xl">Verifique seu email</CardTitle>
              <CardDescription>Enviamos um link de confirmação para seu email</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Conta criada com sucesso
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  20 tokens grátis adicionados
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Clique no link enviado para seu email para ativar sua conta e começar a usar a Fagulha.ia.
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                Não recebeu o email? Verifique sua caixa de spam ou{" "}
                <Link href="/auth/sign-up" className="text-fagulha hover:text-fagulha/80 underline">
                  tente novamente
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
