/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // outras flags que você já esteja usando
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; " +
              // outras diretivas que você já use, por exemplo:
              "style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
          },
        ],
      },
    ];
  },
};

export default nextConfig;
