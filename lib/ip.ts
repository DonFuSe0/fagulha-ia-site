// lib/ip.ts
import { createHmac } from 'crypto';

export function hashIp(ip: string, salt: string) {
  return createHmac('sha256', salt).update(ip).digest('hex');
}

export function extractIpFromHeaders(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '0.0.0.0';
}
