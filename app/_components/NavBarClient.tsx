"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Session = {
  user: { id: string; email?: string | null } | null;
} | null;

export default function NavBarClient() {
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data?.session ?? null);
    });
    return () => { mounted = false };
  }, []);

  return (
    <nav className="w-full bg-black/60 backdrop-blur border-b border-zinc-800 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Fagulha<span className="text-orange-500">.</span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/perfil" className="hover:text-orange-400">Meu Perfil</Link>
              <Link href="/auth/logout" className="hover:text-orange-400">Sair</Link>
            </>
          ) : (
            <Link href="/auth/login" className="hover:text-orange-400">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}