// app/page.tsx (corrigido)

// Aqui apenas removemos o @ts-expect-error, mantendo o comportamento de trocar Entrar/Perfil
// Nenhuma modificação estrutural no layout.

import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const isLogged = !!session?.user

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Bem-vindo ao Fagulha</h1>
      <div className="flex gap-4">
        {!isLogged ? (
          <>
            <a href="/auth/login" className="hover:text-brand">Entrar</a>
            <a href="/explorar" className="hover:text-brand">Explorar</a>
            <a href="/planos" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium">Planos</a>
          </>
        ) : (
          <>
            <a href="/dashboard" className="hover:text-brand">Perfil</a>
            <a href="/explorar" className="hover:text-brand">Explorar</a>
            <a href="/planos" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 font-medium">Planos</a>
          </>
        )}
      </div>
    </main>
  )
}
