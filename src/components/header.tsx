import Link from 'next/link';
import Image from 'next/image';
import { supabaseServer } from '@/lib/supabase/server';

export default async function Header() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | undefined;
  let avatarUrl: string | undefined;
  let nickname: string | undefined;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, nickname')
      .eq('id', user.id)
      .maybeSingle();

    displayName = data?.display_name || undefined;
    avatarUrl = data?.avatar_url || undefined;
    nickname = data?.nickname || undefined;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" width={28} height={28} alt="Fagulha" />
          <span className="font-semibold text-[var(--text)]">Fagulha</span>
        </Link>

        <nav className="flex items-center gap-4 text-[var(--text)]">
          <Link href="/explore" className="hover:opacity-80">
            Explorar
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="hover:opacity-80">
                Painel
              </Link>
              <Link href="/generate" className="hover:opacity-80">
                Gerar
              </Link>
              <Link href="/my-gallery" className="hover:opacity-80">
                Minha galeria
              </Link>
              <Link href="/pricing" className="hover:opacity-80">
                Planos
              </Link>
              <Link href="/profile" className="hover:opacity-80">
                Perfil
              </Link>
              <form action="/auth/signout" method="post">
                <button className="hover:opacity-80" type="submit">
                  Sair
                </button>
              </form>

              <div className="ml-2 flex items-center gap-2">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full border border-[var(--border)] object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-xs">
                    {nickname?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm opacity-80">
                  {nickname || displayName || user.email}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link href="/pricing" className="hover:opacity-80">
                Planos
              </Link>
              <Link href="/auth/login" className="hover:opacity-80">
                Entrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
