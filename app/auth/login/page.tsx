// app/auth/login/page.tsx — formulário acessível + nomes/ids corretos
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
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="w-full border rounded px-3 py-2 bg-transparent"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full border rounded px-3 py-2 bg-transparent"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded px-3 py-2 border"
          disabled={loading}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
      </form>
    </main>
  )
}