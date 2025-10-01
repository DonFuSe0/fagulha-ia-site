// Server Component (sem 'use client')
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function Header() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <header className="border-b border-gray-800 bg-gray-950/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <a href="/" className="text-lg font-semibold text-white">Fagulha IA</a>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/explore" className="text-gray-300 hover:text-white">Explorar</a>
          <a href="/generate" className="text-gray-300 hover:text-white">Gerar</a>
          {user ? (
            <>
              <a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>
              <form action="/api/auth/logout" method="POST">
                <button className="rounded bg-gray-800 px-3 py-1.5 text-gray-200 hover:bg-gray-700">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <a href="/auth/login" className="text-gray-300 hover:text-white">Entrar</a>
              <a href="/auth/signup" className="rounded bg-brand px-3 py-1.5 font-medium text-black hover:bg-brand-light">Criar conta</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
