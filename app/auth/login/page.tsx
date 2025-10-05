'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TurnstileFixed from '@/app/_components/TurnstileFixed'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!token) {
      setError('Por favor, complete a verificação de segurança antes de continuar.')
      return
    }
    
    setLoading(true)
    
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken: token })
      })
      
      const json = await resp.json().catch(() => ({}))
      
      if (!resp.ok || json?.ok === false) {
        if (json?.error === 'captcha_failed') {
          setError('Falha na verificação de segurança. Tente recarregar a página.')
        } else if (json?.error?.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos. Verifique suas credenciais.')
        } else if (json?.error?.includes('Email not confirmed')) {
          setError('Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.')
        } else {
          setError(json?.error || 'Não foi possível entrar. Verifique suas credenciais.')
        }
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleTurnstileVerify = (verificationToken: string) => {
    setToken(verificationToken)
    setError(null) // Clear any previous errors when verification succeeds
  }

  const handleTurnstileError = () => {
    setToken(null)
    setError('Falha na verificação de segurança. Tente recarregar a página.')
  }

  const handleTurnstileExpire = () => {
    setToken(null)
    setError('Verificação expirada. Complete novamente a verificação de segurança.')
  }

  return (
    <main className="min-h-[80vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Entrar</h1>
          <p className="text-sm text-gray-400">Acesse sua conta Fagulha IA</p>
        </div>
        
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-orange-500/50 transition-colors"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm opacity-80">Senha</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 outline-none focus:border-orange-500/50 transition-colors"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          
          <div className="pt-2">
            <TurnstileFixed 
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              theme="dark"
            />
            <p className="text-xs opacity-70 mt-2 text-center">
              Protegido por Cloudflare Turnstile
            </p>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !token}
            className="w-full px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-500/50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div className="text-center">
            <p className="text-xs opacity-70">
              Não tem conta?{' '}
              <a href="/auth/signup" className="underline hover:text-orange-400 transition-colors">
                Criar cadastro
              </a>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
