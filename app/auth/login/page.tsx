// app/auth/login/page.tsx — Dark (preto/cinza) + acentos laranja, acessível
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/perfil')
  }

  return (
    <main className="min-h-screen bg-black text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-[#0b0b0b] to-[#131313] shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Entrar<span className="text-orange-500">.</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Acesse sua conta para gerar imagens com seus tokens.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm text-gray-300">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 focus:border-orange-500 focus:outline-none px-4 py-3 placeholder:text-gray-500"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm text-gray-300">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 focus:border-orange-500 focus:outline-none px-4 py-3 placeholder:text-gray-500"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-orange-600 hover:bg-orange-500 transition-colors px-4 py-3 font-medium"
                disabled={loading}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>

              {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            </form>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />
        </div>
      </div>
    </main>
  )
}