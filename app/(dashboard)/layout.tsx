import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

// Este layout protege todas as rotas filhas dentro do grupo (dashboard).
// Ele verifica no servidor se o usuário está logado antes de renderizar a página.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não houver sessão ativa, redireciona para a página de login.
  if (!session) {
    redirect('/login?message=Você precisa estar logado para acessar esta página.');
  }

  // Se a sessão existir, a página interna é renderizada.
  return <>{children}</>;
}
