'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Turnstile from '@/app/_components/Turnstile'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
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
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname, turnstileToken })
      })
      const json = await resp.json().catch(() => ({}))
      if (!resp.ok || json?.ok === false) {
        setError(json?.error || 'Não foi possível criar sua conta.')
      } else {
        router.push('/auth/confirmar-email')
      }
    } catch (err: any) {
      setError('Não foi possível criar sua conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] w-full flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-5 p-8 rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl">
        <h1 className="text-3xl font-bold">Criar conta</h1>

        <div className="space-y-1">
          <label className="text-sm opacity-80">Apelido</label>
          <input
            type="text"
            value={nickname}
            onChange={(e)=>setNickname(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 outline-none"
            placeholder="Seu apelido"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm opacity-80">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 outline-none"
            placeholder="voce@email.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm opacity-80">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 outline-none"
            placeholder="••••••••"
          />
        </div>

        <div className="pt-2">
          <Turnstile onVerify={(t) => setTurnstileToken(t)} />
          <p className="text-xs opacity-70 mt-1">Protegido por Cloudflare Turnstile</p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="w-full px-4 py-3 rounded-lg font-semibold transition
                     disabled:opacity-50 disabled:cursor-not-allowed
                     bg-orange-500 hover:bg-orange-600"
        >
          {loading ? 'Criando...' : 'CRIAR CONTA'}
        </button>

        <p className="text-xs opacity-70">
          Ao criar sua conta, você concorda com nossos termos de uso.
        </p>
      </form>
    </main>
  )
}
