import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="glass text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-fagulha rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enviamos um link de confirmação para você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, verifique seu email e clique no link de confirmação para ativar sua conta.
            </p>
            <div className="pt-4">
              <Link href="/auth/login" className="text-fagulha-primary hover:underline text-sm">
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
