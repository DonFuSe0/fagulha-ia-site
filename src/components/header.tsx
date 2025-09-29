import Link from 'next/link';
import Image from 'next/image';
import { supabaseServer } from '@/lib/supabase/server';
import SignOutButton from '@/components/auth/SignOutButton';

export default async function Header() {
  // Determine whether the user is logged in.  Because this is a
  // server component we can query Supabase directly.  We always
  // call `getUser()` instead of `getSession()` here because `getUser()`
  // revalidates the token with Supabase on every request【902179082906728†L254-L280】.
  const supabase = supabaseServer();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = !userError ? userData?.user : null;
  // When the user is logged in, fetch additional profile data to display
  // their display name and avatar.  We request only the fields we need.
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    displayName = profile?.display_name ?? null;
    avatarUrl = profile?.avatar_url ?? null;
  }
  return (
    <header className="w-full border-b border-border bg-surface text-text shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {/* Logo image */}
          <Image src="/logo.png" alt="Fagulha logo" width={32} height={32} />
          <span className="font-semibold text-xl">Fagulha</span>
        </Link>
        {/* Left side navigation links */}
        <nav className="flex space-x-4 text-sm items-center">
          <Link href="/explore" className="hover:text-primary">Explorar</Link>
          {user && (
            <>
              <Link href="/dashboard" className="hover:text-primary">Painel</Link>
              <Link href="/generate" className="hover:text-primary">Gerar</Link>
              <Link href="/my-gallery" className="hover:text-primary">Minha galeria</Link>
            </>
          )}
          <Link href="/pricing" className="hover:text-primary">Planos</Link>
        </nav>
        {/* Right side: auth actions */}
        <div className="flex items-center space-x-3 text-sm">
          {user ? (
            <>
              {/* Avatar or initial */}
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center uppercase">
                  {displayName ? displayName.charAt(0) : user.email?.charAt(0) || 'U'}
                </span>
              )}
              {/* Display name fallback to email if not provided */}
              <span className="font-medium">
                {displayName || user.email || 'Usuário'}
              </span>
              <Link href="/profile" className="hover:text-primary">
                Perfil
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/auth/login" className="hover:text-primary">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
