import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Se quiser rodar middleware no edge, mantenha padrão (edge).
// Para evitar avisos do Edge (Node APIs), você pode alternar para nodejs em rotas específicas.
// export const runtime = 'edge'

export async function middleware(req: NextRequest) {
  // Clona o cabeçalho da request para preservar cookies/headers ao encaminhar
  const res = NextResponse.next({
    request: { headers: new Headers(req.headers) },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: '', expires: new Date(0), ...options })
        },
      },
    }
  )

  // Força refresh de sessão se necessário e sincroniza cookies
  await supabase.auth.getUser()

  return res
}

// Protege rotas autenticadas (ajuste conforme suas páginas)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/profile/:path*',
    '/minha-galeria/:path*',
  ],
}
