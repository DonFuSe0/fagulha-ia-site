export const dynamic = 'force-dynamic';

import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="max-w-md mx-auto bg-surface border border-border rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <SignUpForm />
      <p className="text-sm text-muted mt-4 text-center">
        Já possui conta?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">Entrar</Link>
      </p>
    </div>
  );
}