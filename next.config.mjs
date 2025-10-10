/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Keep any experimental flags you already rely on here
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },

  // ✅ Allow Next/Image to optimize avatars from Supabase Storage
  //    and any fallback images from Freepik (as seen in logs).
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        pathname: '/**',
      },
    ],
  },

  // ✅ Permanent redirect we already use in production
  async redirects() {
    return [
      { source: '/explore', destination: '/explorar', permanent: true },
    ];
  },
};

export default nextConfig;
