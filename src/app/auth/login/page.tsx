export const dynamic = 'force-dynamic';

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  // Verifica se a conta foi criada e precisa confirmação por e-mail
  const verify = searchParams?.verify;
  return (
    <div className="max-w-md mx-auto bg-surface border border-border rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      {verify && (
        <p className="text-success text-sm mb-2">
          Sua conta foi criada! Verifique seu e-mail para ativá-la antes de entrar.
        </p>
      )}
      <LoginForm />
      <p className="text-sm text-muted mt-4 text-center">
        Não tem uma conta?{' '}
        <Link href="/auth/sign-up" className="text-primary hover:underline">Crie uma agora</Link>
      </p>
    </div>
  );
}
