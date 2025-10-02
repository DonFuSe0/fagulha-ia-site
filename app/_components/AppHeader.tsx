
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import UserMenu from "./UserMenu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fallbackAvatarFor(userId: string) {
  let h = 0; for (let i = 0; i < userId.length; i++) h = ((h << 5) - h) + userId.charCodeAt(i) | 0;
  const idx = Math.abs(h) % 4;
  return `/avatars/fire-${idx + 1}.png`;
}

export default async function AppHeader() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  let nickname: string | null = null;
  let credits: number | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, nickname, credits")
      .eq("id", user.id)
      .maybeSingle();

    const metaNick = (user.user_metadata && typeof user.user_metadata.nickname === "string")
      ? String(user.user_metadata.nickname) : null;

    nickname = profile?.nickname ?? metaNick ?? (user.email?.split("@")[0] ?? null);
    const rawAvatar = profile?.avatar_url ?? null;
    avatarUrl = rawAvatar ? `${rawAvatar}${rawAvatar.includes("?") ? "&" : "?"}v=${Date.now()}` : null;
    credits = profile?.credits ?? null;
  }

  const avatarSrc = user ? (avatarUrl || fallbackAvatarFor(user.id)) : "/avatars/fire-1.png";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(180deg,rgba(6,6,6,.7),rgba(6,6,6,.5))] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-white">Fagulha IA</Link>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/explorar" className="text-sm text-white/80 hover:text-white">Explorar</Link>
          <Link href="/gallery" className="text-sm text-white/80 hover:text-white">Galeria</Link>
          <Link href="/dashboard" className="text-sm text-white/80 hover:text-white">Dashboard</Link>
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu isLogged={true} avatarSrc={avatarSrc} nickname={nickname ?? undefined}
                credits={typeof credits === "number" ? credits : undefined} />
            ) : (
              <Link href="/auth/login" className="text-white/80 hover:text-white text-sm">Entrar</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
