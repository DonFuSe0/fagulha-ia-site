// app/auth/login/page.tsx — same style as signup; uses cookie-based client
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace('/perfil')
    } catch (err: any) {
      setError(err?.message || 'Falha ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-black text-zinc-200 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Entrar</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Use seu email e senha para acessar.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm text-zinc-300">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="w-full h-11 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none px-3 placeholder:text-zinc-500"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm text-zinc-300">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full h-11 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none px-3 placeholder:text-zinc-500"
                  placeholder="Sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-900 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
            </form>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />
        </div>
      </div>
    </div>
  )
}