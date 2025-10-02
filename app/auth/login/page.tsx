'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Turnstile from '@/app/_components/Turnstile'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const serverError = params.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!turnstileToken) {
      setError('Confirme o captcha antes de continuar.')
      return
    }
    setLoading(true)
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken })
      })
      const json = await resp.json().catch(() => ({}))
      if (!resp.ok || json?.ok === false) {
        setError(json?.error || 'Não foi possível entrar.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Entrar</h1>
        {serverError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
            {serverError}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
          <div className="space-y-1">
            <label className="text-sm opacity-80">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm opacity-80">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <div className="pt-2">
            <Turnstile onVerify={setTurnstileToken} />
            <p className="text-xs opacity-70 mt-1">Protegido por Cloudflare Turnstile</p>
          </div>

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="w-full px-4 py-3 rounded-lg font-semibold transition
                       disabled:opacity-50 disabled:cursor-not-allowed
                       bg-orange-500 hover:bg-orange-600"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-xs opacity-70 pt-1">
            Não tem conta? <a href="/auth/signup" className="underline">Criar cadastro</a>
          </p>
        </form>
      </div>
    </main>
  )
}
