/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // Ver erros no dev/CI; manter “flex” em produção
  eslint: { ignoreDuringBuilds: isProd },
  typescript: { ignoreBuildErrors: isProd },

  images: { unoptimized: true },
  output: "standalone",

  // A opção mudou no Next 15.x:
  serverExternalPackages: ["@supabase/supabase-js"],
};

export default nextConfig;
