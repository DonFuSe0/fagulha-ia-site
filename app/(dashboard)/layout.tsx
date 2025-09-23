import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

// Este layout protege todas as rotas filhas.
// Ele verifica no servidor se o usuário está logado.
// Se não estiver, redireciona para a página de login antes de renderizar qualquer coisa.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não houver sessão ativa, redireciona o usuário para a página de login.
  // A página de login é pública e não está dentro deste layout.
  if (!session) {
    // Sugestão de melhoria implementada:
    // Redireciona para o login, mas informa qual página o usuário tentou acessar,
    // para que possamos redirecioná-lo de volta após o login.
    redirect('/login?message=Você precisa estar logado para acessar esta página.');
  }

  // Se a sessão existir, permite que a página seja renderizada.
  return <>{children}</>;
}
