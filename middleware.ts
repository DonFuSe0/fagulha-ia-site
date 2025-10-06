// middleware.ts — CSP relax: adiciona 'unsafe-eval' e 'unsafe-inline' TEMPORARIAMENTE
import { NextResponse, type NextRequest } from 'next/server'

function createNonce() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  let str = ''
  for (const b of arr) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'')
}

export function middleware(_req: NextRequest) {
  const nonce = createNonce()
  const res = NextResponse.next()
  res.headers.set('x-nonce', nonce)

  const csp = [
    "default-src 'self'",
    // TEMP: desbloqueia inline + eval até limparmos libs que usam isso
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}'`,
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "img-src 'self' data: blob: https://*.supabase.co",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; ')

  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = { matcher: '/:path*' }