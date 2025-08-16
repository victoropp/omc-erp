/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // Using pages directory for now
  },
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3010',
    NEXT_PUBLIC_APP_NAME: 'Ghana OMC ERP',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/:path*`,
      },
    ];
  },
  typescript: {
    // Skip type checking during build (we'll do it separately)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Skip ESLint during build (we'll do it separately)
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;