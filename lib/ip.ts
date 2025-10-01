// Helpers de IP/HMAC usados no signup
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

export function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0].trim();
    if (first) return first;
  }
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  // Em dev/local
  return req.ip ?? null as any;
}

export function hashIpHmac(ip: string): string {
  const salt = process.env.SIGNUP_SALT || 'fallback-signup-salt';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex');
}
