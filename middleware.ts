// middleware.ts – versão modificada
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // Pode remover nonce ou strict-dynamic se estiver bloqueando
  const csp = [
    `default-src 'self'`,
    `script-src 'self' https://challenges.cloudflare.com 'unsafe-inline'`,
    `frame-src https://challenges.cloudflare.com`,
    `connect-src 'self'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `base-uri 'self'`,
    `form-action 'self'`
  ].join("; ")

  res.headers.set("Content-Security-Policy", csp)
  return res
}

export const config = {
  matcher: ["/auth/login", "/auth/signup"]
}
