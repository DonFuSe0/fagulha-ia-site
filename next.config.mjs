// next.config.mjs ou .js
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' https://challenges.cloudflare.com 'nonce-*'; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
