'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browserClient'

export default function EntrarPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-xl border border-white/10 bg-white/5">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <div className="space-y-1">
          <label className="text-sm">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 outline-none"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="pt-2 text-xs opacity-80">
          <span>Ainda não tem conta? </span>
          <Link href="/auth/signup" className="underline hover:opacity-90">Criar cadastro</Link>
        </div>
      </form>
    </main>
  )
}
