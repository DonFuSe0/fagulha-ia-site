// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' https://challenges.cloudflare.com 'nonce-*' 'unsafe-inline'; " +
              "frame-src https://challenges.cloudflare.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: blob:;"
          }
        ]
      }
    ]
  }
}

export default nextConfig
