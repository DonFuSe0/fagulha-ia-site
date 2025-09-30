import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // A resposta que vamos devolver (e atualizar cookies quando necessário)
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Edge runtime: usar getAll/setAll
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // espelha no request
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // cria nova response e espelha no response
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // **Obrigatório** para manter sessão viva no SSR (ver docs)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/auth')
  const isProtected = ['/dashboard', '/generate', '/profile'].some((p) =>
    pathname.startsWith(p),
  )

  // Protege rotas
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Evita ficar em /auth/* se já estiver logado
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Ignora estáticos e imagens
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
}
