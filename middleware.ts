// middleware.ts — Edge-safe (sem 'import crypto from "crypto"')
import { NextResponse, type NextRequest } from 'next/server'

function createNonce() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  // base64-url encode
  let str = ''
  for (const b of arr) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'')
}

export function middleware(_req: NextRequest) {
  const nonce = createNonce()

  const res = NextResponse.next()

  // envia o nonce para uso no layout via headers()
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