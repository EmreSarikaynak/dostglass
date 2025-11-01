/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages için optimizasyon
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
