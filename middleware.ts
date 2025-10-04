import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export function middleware(request: NextRequest) {
  // Nonce por requisição
  const nonce = crypto.randomUUID()

  const csp = [
    "default-src 'self'",
    // Usa nonce + strict-dynamic para liberar scripts com o mesmo nonce.
    `script-src 'nonce-${nonce}' https://challenges.cloudflare.com 'strict-dynamic'`,
    "frame-src https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://challenges.cloudflare.com"
  ].join('; ')

  const res = NextResponse.next()
  res.headers.set('Content-Security-Policy', csp)
  // Enviamos a nonce via header para o layout injetar em uma <meta>
  res.headers.set('x-nonce', nonce)
  return res
}
