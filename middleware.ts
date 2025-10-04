// middleware.ts (na raiz do projeto)
import { NextResponse, NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export function middleware(request: NextRequest) {
  const nonce = randomUUID().replace(/-/g, '')

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com 'unsafe-inline'`,
    "frame-src https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'"
  ].join('; ')

  const reqHeaders = new Headers(request.headers)
  reqHeaders.set('x-nonce', nonce)
  reqHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({
    request: {
      headers: reqHeaders
    }
  })
  response.headers.set('Content-Security-Policy', csp)
  return response
}
