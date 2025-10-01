// lib/ip.ts
import type { NextRequest } from 'next/server';
import { createHmac } from 'crypto';

/**
 * Extrai o IP do cliente a partir dos headers comuns (proxy/CDN).
 * Ordem: x-forwarded-for (primeiro), cf-connecting-ip, x-real-ip, x-client-ip.
 */
export function getClientIp(req: NextRequest): string | null {
  const h = req.headers;

  const xff = h.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }

  const cf = h.get('cf-connecting-ip');
  if (cf) return cf;

  const real = h.get('x-real-ip');
  if (real) return real;

  const xclient = h.get('x-client-ip');
  if (xclient) return xclient;

  return null;
}

/** HMAC-SHA256 do IP usando salt/segredo. */
export function hashIpHmac(ip: string, salt: string): string {
  return createHmac('sha256', salt).update(ip).digest('hex');
}
