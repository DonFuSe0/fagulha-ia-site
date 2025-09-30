import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/serverClient';

/**
 * Header component. This is a Server Component so it can access the current
 * session via the Supabase server client. Depending on whether a user is
 * logged in or not, it shows different navigation items.
 */
export default async function Header() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  return (
    <header className="bg-background border-b border-gray-800">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/">
          <span className="text-2xl font-semibold text-white">Fagulha&nbsp;IA</span>
        </Link>
        <div className="flex items-center space-x-4">
          {/* Public link always shown */}
          <Link
            href="/explore"
            className="text-gray-300 transition-colors hover:text-white"
          >
            Explorar
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-300 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/generate"
                className="text-gray-300 transition-colors hover:text-white"
              >
                Gerar
              </Link>
              {/* Logout form posts to a route that invalidates the session */}
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-300 transition-colors hover:text-white"
              >
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="rounded bg-brand px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-brand-light"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}