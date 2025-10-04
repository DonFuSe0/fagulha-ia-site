// middleware.ts (na raiz do projeto)

import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export function middleware(request: NextRequest) {
  try {
    // Geração de nonce compatível com Edge: usar crypto.randomUUID (suportado no Edge Runtime) :contentReference[oaicite:0]{index=0}
    const nonce = crypto.randomUUID()

    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com 'unsafe-inline'`,
      "frame-src https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join('; ')

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', csp)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    response.headers.set('Content-Security-Policy', csp)

    return response
  } catch (err) {
    console.error('Erro no middleware:', err)
    // Fallback: continuar sem CSP custom
    return NextResponse.next()
  }
}
