
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fallbackAvatarFor(userId: string) {
  let h = 0; for (let i = 0; i < userId.length; i++) h = ((h << 5) - h) + userId.charCodeAt(i) | 0;
  const idx = Math.abs(h) % 4;
  return `/avatars/fire-${idx + 1}.png`;
}

export default async function ProfileHero() {
  const supabase = createServerComponentClient<any>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, nickname, credits")
    .eq("id", user.id)
    .maybeSingle();

  const nickname = (profile?.nickname && profile.nickname.length > 0)
    ? profile.nickname
    : (user.email?.split("@")[0] ?? "Usuário");

  const rawAvatar = profile?.avatar_url ?? null;
  const avatarSrc = rawAvatar
    ? `${rawAvatar}${rawAvatar.includes("?") ? "&" : "?"}v=${Date.now()}`
    : fallbackAvatarFor(user.id);

  const credits = profile?.credits ?? 0;

  return (
    <section className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-center gap-4">
        <span className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-white/10">
          <Image src={avatarSrc} alt="avatar" fill className="object-cover" />
        </span>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-white">{nickname}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-white/60">Saldo</div>
        <div className="text-2xl font-semibold text-white">
          {credits} <span className="text-sm font-normal text-white/60">tokens</span>
        </div>
      </div>
    </section>
  );
}
