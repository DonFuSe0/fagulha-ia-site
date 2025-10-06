// next.config.mjs — CSP relax (TEMP): permite 'unsafe-inline' e 'unsafe-eval'
/** @type {import('next').NextConfig} */

// ⚠️ TEMP: Destrava bundles/terceiros que usam inline/eval enquanto removemos isso do código.
// Depois de confirmar que o fluxo está ok, volte a endurecer (remover 'unsafe-inline' e 'unsafe-eval').
const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  media-src 'self' https:;
  frame-src 'self';
  worker-src 'self' blob:;
  base-uri 'self';
  form-action 'self' https://*.supabase.co;
`.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  // CSP principal
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  // XSS
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;