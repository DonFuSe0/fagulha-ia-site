import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/serverClient';

export default async function Header() {
  const supabase = supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  return (
    <header className="border-b border-gray-800 bg-[#0a0c10]/80 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-brand">Fagulha IA</Link>
          <Link href="/explore" className="text-sm text-gray-300 hover:text-white">Explorar</Link>
          <Link href="/generate" className="text-sm text-gray-300 hover:text-white">Gerar</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-400 sm:inline">{user.email}</span>
              <Link href="/dashboard" className="rounded bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700">Dashboard</Link>
              <form action="/auth/logout" method="POST">
                <button type="submit" className="rounded bg-brand px-4 py-2 text-sm font-medium text-black hover:bg-brand-light">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded px-4 py-2 text-sm hover:bg-gray-800">Entrar</Link>
              <Link href="/auth/signup" className="rounded bg-brand px-4 py-2 text-sm font-medium text-black hover:bg-brand-light">
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
