import LoginForm from '@/components/auth/LoginForm';
import { unstable_noStore as noStore } from 'next/cache';

export const runtime = 'nodejs';       // garante Node, evita Edge para esta page
export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

export default async function LoginPage({
  searchParams,
}: {
  // Next 15 pode fornecer searchParams como Promise
  searchParams?: Promise<SP> | SP;
}) {
  noStore();

  let sp: SP = {};
  if (typeof (searchParams as any)?.then === 'function') {
    // é Promise
    sp = (await (searchParams as Promise<SP>)) ?? {};
  } else {
    sp = (searchParams as SP) ?? {};
  }

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
