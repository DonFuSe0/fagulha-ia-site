// app/page.tsx
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  const isLogged = !!session?.user

  return (
    <main>
      {/* ... o restante do seu conteúdo/hero vai aqui ... */}
      <div className="flex gap-3">
        {!isLogged ? (
          <Link href="/auth/login" className="inline-flex items-center rounded-md border border-white/10 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm">
            Entrar
          </Link>
        ) : (
          <Link href="/dashboard" className="inline-flex items-center rounded-md border border-white/10 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm">
            Perfil
          </Link>
        )}
      </div>
    </main>
  )
}
