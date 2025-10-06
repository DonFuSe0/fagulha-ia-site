'use client'

import Header from "@/components/Header"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setOkMsg(null); setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setOkMsg("Conta criada! Verifique seu e-mail.")
    router.replace("/dashboard")
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">Criar conta</h1>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-zinc-950/70 border border-zinc-800 px-3 py-2 outline-none focus:border-brand placeholder:text-zinc-500"
                placeholder="Crie uma senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {okMsg && <p className="text-emerald-400 text-sm">{okMsg}</p>}

            <div className="text-center text-sm text-zinc-400">
              Já tem conta? <a className="text-brand hover:underline" href="/auth/login">Entrar</a>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}