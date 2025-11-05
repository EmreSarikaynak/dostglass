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
  // Cloudflare Pages için gerekli ayarlar
  output: 'standalone',
  experimental: {
    // Cloudflare Workers ile uyumluluk için
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Turbopack yerine webpack kullan (Cloudflare uyumluluğu için)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      // Node.js modüllerini external olarak işaretle
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    return config;
  },
};

export default nextConfig;
