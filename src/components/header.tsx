import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Header como Server Component para ler a sessão via cookies (SSR).
 * noStore() evita cache e garante estado atual do usuário.
 */
export default async function Header() {
  noStore();
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-[var(--text)] font-semibold">
          Fagulha
        </Link>

        <nav className="flex items-center gap-4 text-[var(--text)]">
          <Link href="/explore" className="hover:opacity-80">Explorar</Link>
          <Link href="/pricing" className="hover:opacity-80">Planos</Link>

          {user ? (
            <>
              <Link href="/dashboard" className="hover:opacity-80">Painel</Link>
              <Link href="/generate" className="hover:opacity-80">Gerar</Link>
              <Link href="/my-gallery" className="hover:opacity-80">Minha galeria</Link>
              <Link href="/profile" className="hover:opacity-80">Perfil</Link>
              <Link href="/auth/logout" className="rounded bg-[var(--danger)] px-3 py-1 text-white hover:opacity-90">
                Sair
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className="rounded bg-[var(--primary)] px-3 py-1 text-white hover:opacity-90">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
