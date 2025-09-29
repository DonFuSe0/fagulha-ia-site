import SignUpForm from '@/components/auth/SignUpForm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function Page() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">
        <h1 className="mb-1 text-2xl font-semibold text-[var(--text)]">Criar conta</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">Cadastre-se para começar a gerar imagens.</p>
        <SignUpForm />
        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Já tem conta?{' '}
          <a href="/auth/login" className="text-[var(--primary)] hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
