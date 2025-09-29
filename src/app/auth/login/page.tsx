export const dynamic = 'force-dynamic';

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

/*
 * Next.js 15 changed the type of `searchParams` for server components to be a
 * Promise that resolves to the parsed query object. Using the older
 * synchronous type causes a TypeScript constraint error during build. To
 * accommodate this, we define the page component as `async` and await
 * the `searchParams` promise. See the Next.js documentation for details:
 * https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await the search params to access individual query values
  const params = await searchParams;
  const verify = params?.verify;
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
        <Link href="/auth/sign-up" className="text-primary hover:underline">
          Crie uma agora
        </Link>
      </p>
    </div>
  );
}
