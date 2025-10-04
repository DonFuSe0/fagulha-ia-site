export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "script-src 'self' https://challenges.cloudflare.com 'unsafe-inline'; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline';"
          },
        ],
      },
    ]
  }
}
