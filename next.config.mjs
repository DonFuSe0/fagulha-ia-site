/** @type {import('next').NextConfig} */

const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  media-src 'self' https:;
  frame-src 'self';
  worker-src 'self' blob:;
  base-uri 'self';
  form-action 'self' https://*.supabase.co;
`.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }
    ],
    formats: ['image/avif','image/webp']
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;