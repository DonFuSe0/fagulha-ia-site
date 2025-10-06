/** @type {import('next').NextConfig} */

// ⚠️ Ajuste de CSP para permitir Supabase e WebSockets do Supabase.
// Removemos 'strict-dynamic' e qualquer nonce para não bloquear bundles do Next.
// Mantenha simples e segura.
const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self';
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
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // Endurecer navegação
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '0' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Headers globais
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
