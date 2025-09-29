import Link from 'next/link';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Header() {
  // ler cookies() torna o componente dinâmico por requisição
  cookies();

  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Fagulha" className="h-6 w-auto" />
          <span className="font-semibold text-[var(--text)]">Fagulha</span>
        </Link>

        {!user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/explore" className="text-[var(--muted)] hover:text-[var(--text)]">Explorar</Link>
            <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--text)]">Planos</Link>
            <Link href="/auth/login" className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-white hover:bg-[var(--primary-600)]">Entrar</Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/explore" className="text-[var(--muted)] hover:text-[var(--text)]">Explorar</Link>
            <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--text)]">Painel</Link>
            <Link href="/generate" className="text-[var(--muted)] hover:text-[var(--text)]">Gerar</Link>
            <Link href="/my-gallery" className="text-[var(--muted)] hover:text-[var(--text)]">Minha galeria</Link>
            <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--text)]">Planos</Link>
            <Link href="/profile" className="text-[var(--muted)] hover:text-[var(--text)]">Perfil</Link>
            <form action="/auth/logout" method="post">
              <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--muted)] hover:text-[var(--text)]">
                Sair
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
