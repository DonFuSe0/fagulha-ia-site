// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/explore',
        destination: '/explorar',
        permanent: true, // 308 permanente
      },
    ]
  },
}

export default nextConfig
