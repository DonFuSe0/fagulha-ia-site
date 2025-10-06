// middleware.ts — adiciona CSP com nonce por request
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export function middleware(req: Request) {
  const nonce = crypto.randomBytes(16).toString('base64')
  const res = NextResponse.next({
    request: { headers: new Headers(req.headers) }
  })
  res.headers.set('x-nonce', nonce)

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "style-src 'self' 'unsafe-inline'",
    "frame-src https://challenges.cloudflare.com",
    "font-src 'self' data:",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; ')

  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = { matcher: '/:path*' }