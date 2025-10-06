"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Session = {
  user: { id: string; email?: string | null } | null;
} | null;

export default function NavBarClient() {
  const supabase = createClient();
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
  let mounted = true
  supabase.auth.getSession().then(({ data }) => {
    if (mounted) setSession(data?.session ?? null)
  })
  return () => { mounted = false }
}, [supabase]);

  const isLogged = Boolean(session?.user?.id);

  return (
    <nav className="w-full">
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/auth/login"
          className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
        >
          Entrar
        </Link>

        <Link
          href="/explorar"
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium border border-zinc-700"
        >
          Explorar
        </Link>

        <Link
          href="/tokens"
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm font-medium border border-zinc-800"
        >
          Tokens
        </Link>

        {/* Dropdown Perfil apenas logado */}
        {isLogged && (
          <div className="relative group">
            <button className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm font-medium border border-zinc-800">
              Perfil
            </button>
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl hidden group-hover:block">
              <Link
                href="/perfil"
                className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 rounded-t-xl"
              >
                Meu perfil
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                Configurações
              </Link>
              <Link
                href="/auth/logout"
                className="block px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 rounded-b-xl"
              >
                Sair
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
