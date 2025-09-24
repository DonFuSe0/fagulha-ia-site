/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // vê erros no dev/CI; mantém "flex" na produção
  eslint: { ignoreDuringBuilds: isProd },
  typescript: { ignoreBuildErrors: isProd },

  images: { unoptimized: true },
  output: "standalone",

  // Next 15.x: external packages no server
  serverExternalPackages: ["@supabase/supabase-js"],
};

export default nextConfig;
