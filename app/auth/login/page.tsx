// app/auth/login/page.tsx (apenas altera o destino pós-login para /dashboard)
// Se seu arquivo for diferente, mantenha sua UI e só troque o router para /dashboard.
'use client'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.replace('/dashboard') // <<<<<< DESTINO AJUSTADO
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-black text-zinc-200 flex items-center justify-center px-4 py-8">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-zinc-300">Email</label>
          <input id="email" name="email" className="w-full h-11 rounded-lg bg-zinc-950 border border-zinc-800 px-3" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-zinc-300">Senha</label>
          <input id="password" name="password" type="password" className="w-full h-11 rounded-lg bg-zinc-950 border border-zinc-800 px-3" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-500 transition-colors">{loading ? 'Entrando…' : 'Entrar'}</button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </main>
  )
}