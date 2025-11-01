/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages için static export
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
