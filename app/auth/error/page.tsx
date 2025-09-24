import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FagulhaLogo } from "@/components/fagulha-logo"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl">Ops, algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {params?.error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">Erro: {params.error}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ocorreu um erro não especificado.</p>
              )}

              <div className="text-sm text-muted-foreground">
                Tente novamente ou{" "}
                <Link href="/contact" className="text-fagulha hover:text-fagulha/80 underline">
                  entre em contato
                </Link>{" "}
                se o problema persistir.
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <Link
              href="/auth/login"
              className="block text-sm text-fagulha hover:text-fagulha/80 underline underline-offset-4"
            >
              Tentar fazer login novamente
            </Link>
            <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
