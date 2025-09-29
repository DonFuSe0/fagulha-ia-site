import LoginForm from '@/components/auth/LoginForm';
import { unstable_noStore as noStore } from 'next/cache';

export const runtime = 'nodejs';       // evita Edge Runtime para esta page
export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

export default async function LoginPage({
  searchParams,
}: {
  // Em Next 15, tipar como Promise<...> corrige o "constraint 'PageProps'"
  searchParams?: Promise<SP>;
}) {
  noStore();

  // Aguarda o searchParams; se vier undefined, usa objeto vazio
  const sp: SP = (await searchParams) ?? {};

  const success = sp.success === '1';
  const errorMsg = typeof sp.error === 'string' ? sp.error : null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>

      {success && (
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
          Enviamos um link de confirmação para o seu e-mail. Verifique sua caixa de entrada para continuar.
        </div>
      )}

      {errorMsg && (
        <div className="rounded border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">
          {errorMsg}
        </div>
      )}

      <LoginForm />
    </div>
  );
}
