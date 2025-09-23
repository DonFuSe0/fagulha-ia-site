'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    let options: any = { email, password };

    if (isSignUp) {
      options.options = { data: { full_name: fullName, username: username } };
    }

    const { error } = await action(options);

    if (error) {
      if (error.message.includes('violates unique constraint "profiles_username_key"')) {
        toast.error('Este nick já está em uso. Por favor, escolha outro.');
      } else if (error.message.includes('User already registered')) {
        toast.error('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (error.message.includes('Password should be at least 6 characters')) {
        toast.error('A senha deve ter no mínimo 6 caracteres.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(isSignUp ? 'Cadastro realizado! Verifique seu e-mail para confirmar.' : 'Login bem-sucedido!');
      router.push(isSignUp ? '/confirm' : '/dashboard');
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">{isSignUp ? 'Crie sua Conta' : 'Acesse sua Conta'}</h1>
          <p className="text-gray-400">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
            <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-medium text-purple-400 hover:underline">
              {isSignUp ? 'Faça Login' : 'Cadastre-se'}
            </button>
          </p>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {isSignUp && (
            <>
              <div><Label className="text-gray-300" htmlFor="full-name">Nome Completo</Label><Input id="full-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-gray-700 border-gray-600 text-white" /></div>
              <div><Label className="text-gray-300" htmlFor="username">Nick (será seu @)</Label><Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} className="bg-gray-700 border-gray-600 text-white" /></div>
            </>
          )}
          <div><Label className="text-gray-300" htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-700 border-gray-600 text-white" /></div>
          <div><Label className="text-gray-300" htmlFor="password">Senha</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-gray-700 border-gray-600 text-white" /></div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">{isSignUp ? 'Cadastrar' : 'Entrar'}</Button>
        </form>

        <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-600" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-800 px-2 text-gray-400">Ou continue com</span></div></div>
        
        <div>
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600 text-white">
            <Chrome className="w-5 h-5 mr-2" /> Google
          </Button>
        </div>
      </div>
    </div>
  );
}
