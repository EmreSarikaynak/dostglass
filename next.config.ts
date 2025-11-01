import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Cloudflare için gerekli
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cuxgnskbdmolbvaatlif.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
