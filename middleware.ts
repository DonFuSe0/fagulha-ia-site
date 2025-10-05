// /middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const nonce = Buffer.from(Date.now().toString()).toString("base64")
  const csp = [
    `default-src 'self'`,
    `script-src 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com`,
    `frame-src https://challenges.cloudflare.com`,
    `connect-src 'self'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `base-uri 'self'`,
    `form-action 'self'`
  ].join("; ")

  res.headers.set("Content-Security-Policy", csp)
  res.headers.set("X-CSP-Nonce", nonce)
  return res
}

export const config = {
  matcher: ["/auth/login", "/auth/signup"]
}
