"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FagulhaLogo } from "@/components/fagulha-logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Login attempt:", { email })

      // For now, just redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Google login attempt")
      setError("OAuth com Google será implementado em breve")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login com Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="text-center">
            <FagulhaLogo size="lg" className="justify-center mb-2" />
            <p className="text-muted-foreground">Entre na sua conta</p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
              <CardDescription>Entre com seu email e senha ou use o Google</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground text-sm"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-fagulha hover:bg-fagulha/90" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <span className="mr-2">🔍</span>
                Continuar com Google
              </Button>

              <div className="mt-6 text-center text-sm">
                Não tem uma conta?{" "}
                <Link href="/auth/sign-up" className="text-fagulha hover:text-fagulha/80 underline underline-offset-4">
                  Criar conta
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
