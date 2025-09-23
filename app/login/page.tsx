'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const redirectMessage = searchParams.get('message')

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (isSignUp) {
      if (username.length < 3) {
        setError('O Nick (apelido) deve ter pelo menos 3 caracteres.')
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Cadastro realizado! Verifique seu e-mail para confirmar a conta.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Link href="/" className="text-3xl font-bold text-white mb-8">
        Fagulha<span className="text-purple-500">.ia</span>
      </Link>
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-2xl border border-purple-500/20">
        <h1 className="text-2xl font-bold text-center text-white">
          {isSignUp ? 'Crie sua Conta' : 'Acesse sua Conta'}
        </h1>
        
        {redirectMessage && <p className="text-yellow-400 text-center bg-yellow-900/50 p-2 rounded-md">{redirectMessage}</p>}

        <form onSubmit={handleAuthAction} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-gray-700 border-gray-600" />
              </div>
              <div>
                <Label htmlFor="username">Nick (mín. 3 caracteres)</Label>
                <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-gray-700 border-gray-600" />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-700 border-gray-600" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-700 border-gray-600" />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-bold">
            {isSignUp ? 'Cadastrar' : 'Entrar'}
          </Button>
        </form>

        {error && <p className="text-red-400 text-center">{error}</p>}
        {message && <p className="text-green-400 text-center">{message}</p>}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">Ou continue com</span>
          </div>
        </div>

        <Button variant="outline" onClick={handleSignInWithGoogle} className="w-full bg-transparent border-gray-600 hover:bg-gray-700">
          Entrar com Google
        </Button>

        <div className="text-center">
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} className="text-sm text-purple-400 hover:underline">
            {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  )
}
