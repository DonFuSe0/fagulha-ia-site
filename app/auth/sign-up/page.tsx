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

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    nickname: "",
    birthDate: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      // Simulate signup process
      console.log("[v0] Signup attempt:", { email: formData.email, displayName: formData.displayName })

      // For now, just redirect to verify email page
      setTimeout(() => {
        router.push("/auth/verify-email")
      }, 1000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Google signup attempt")
      // For now, just show a message
      setError("OAuth com Google será implementado em breve")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta com Google")
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
            <p className="text-muted-foreground">Crie sua conta e ganhe 20 tokens grátis</p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Criar conta</CardTitle>
              <CardDescription>Preencha os dados abaixo para começar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nome completo</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={formData.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname">Apelido</Label>
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="@apelido"
                      required
                      value={formData.nickname}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground text-sm"
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-fagulha hover:bg-fagulha/90" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar conta"}
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
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <span className="mr-2">🔍</span>
                Continuar com Google
              </Button>

              <div className="mt-6 text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-fagulha hover:text-fagulha/80 underline underline-offset-4">
                  Fazer login
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
