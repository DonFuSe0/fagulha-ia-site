import Link from 'next/link';
import Image from 'next/image';
import { supabaseServer } from '@/lib/supabase/server';

export default async function Header() {
  // Determine whether the user is logged in.  Because this is a
  // server component we can query Supabase directly.  The presence of
  // a session indicates an authenticated user.
  const supabase = supabaseServer();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  return (
    <header className="w-full border-b border-border bg-surface text-text shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {/* Logo image */}
          <Image src="/logo.png" alt="Fagulha logo" width={32} height={32} />
          <span className="font-semibold text-xl">Fagulha</span>
        </Link>
        <nav className="flex space-x-4 text-sm">
          <Link href="/explore" className="hover:text-primary">Explorar</Link>
          {user && (
            <>
              <Link href="/dashboard" className="hover:text-primary">Painel</Link>
              <Link href="/generate" className="hover:text-primary">Gerar</Link>
              <Link href="/my-gallery" className="hover:text-primary">Minha galeria</Link>
            </>
          )}
          <Link href="/pricing" className="hover:text-primary">Planos</Link>
          {user ? (
            <Link href="/profile" className="hover:text-primary">Perfil</Link>
          ) : (
            <Link href="/auth/login" className="hover:text-primary">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
