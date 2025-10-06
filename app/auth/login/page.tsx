'use client'

import Header from "@/components/Header"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.replace("/dashboard")
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">Entrar</h1>

          <form onSubmit={onSubmit} className="space-y-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-300">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:border-brand placeholder:text-zinc-500"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-zinc-300">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:border-brand placeholder:text-zinc-500"
                placeholder="Sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="text-center text-sm text-zinc-400">
              Não tem conta? <a className="text-brand hover:underline" href="/auth/signup">Criar conta</a>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}