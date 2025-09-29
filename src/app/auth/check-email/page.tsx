export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function Page() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold text-[var(--text)]">Verifique seu e-mail</h1>
        <p className="text-sm text-[var(--muted)]">
          Enviamos um link de confirmação para o e-mail informado. Clique no link para ativar sua conta e entrar.
        </p>
        <a href="/auth/login" className="mt-6 inline-block text-[var(--primary)] hover:underline">
          Voltar ao login
        </a>
      </div>
    </div>
  );
}
