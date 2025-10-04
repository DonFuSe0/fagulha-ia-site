/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',   // aplica a todas as rotas
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "script-src 'self' https://challenges.cloudflare.com;",
              "frame-src https://challenges.cloudflare.com;",
              // mantenha outros que você já use
            ].join(' ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
