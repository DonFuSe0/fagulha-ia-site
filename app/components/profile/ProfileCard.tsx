"use client";
type Props = { userId: string; email: string; nickname: string | null; avatarUrl: string | null; credits: number; };

export default function ProfileCard({ email, nickname, avatarUrl, credits }: Props) {
  const name = nickname || email.split("@")[0];
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl || "/avatars/fire-1.png"} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10" />
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-sm text-white/70">{email}</div>
        </div>
        <div className="ml-auto text-white/90">
          <span className="text-sm text-white/60">Saldo:</span>{" "}
          <span className="font-semibold">{credits}</span>{" "}
          <span className="text-sm text-white/60">tokens</span>
        </div>
      </div>
    </div>
  );
}
