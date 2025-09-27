/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remova qualquer "experimental.serverComponentsExternalPackages"
  // e use a chave atual:
  serverExternalPackages: [
    "@supabase/ssr",
    "@supabase/supabase-js",
  ],
  // ...demais configs
};

export default nextConfig;
