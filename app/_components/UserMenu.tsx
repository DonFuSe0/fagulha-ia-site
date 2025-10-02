"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = { isLogged: boolean; avatarSrc?: string; nickname?: string; credits?: number; };

export default function UserMenu({ isLogged, avatarSrc="/avatars/fire-1.png", nickname="Usuário", credits }: Props) {
  if (!isLogged) return <Link href="/auth/login" className="text-white/80 hover:text-white text-sm">Entrar</Link>;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 rounded-full pl-2 pr-2.5 py-1 hover:bg-white/10">
        <span className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white/15">
          <Image src={avatarSrc} alt="avatar" fill className="object-cover" />
        </span>
        <span className="max-w-[140px] truncate text-sm text-white/90">{nickname}</span>
        {typeof credits === "number" && (
          <span className="ml-1 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-[2px] text-[11px] text-white/80">
            {credits} <span className="ml-1 text-white/50">tokens</span>
          </span>
        )}
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/60"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-neutral-900/95 p-1 shadow-xl">
          <Link href="/settings?tab=perfil" className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">Editar perfil</Link>
          <Link href="/settings?tab=seguranca" className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">Alterar senha</Link>
          <Link href="/settings?tab=tokens" className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">Tokens</Link>
          <Link href="/gallery" className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">Minha galeria</Link>
          <div className="my-1 h-px bg-white/10" />
          <form action="/api/auth/logout" method="POST">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-300 hover:bg-white/10">Sair</button>
          </form>
        </div>
      )}
    </div>
  );
}
