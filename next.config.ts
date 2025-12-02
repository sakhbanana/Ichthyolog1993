import type { NextConfig } from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // В dev PWA отключена
});

const nextConfig: NextConfig = {
  output: 'export', // ✔ Главная строка для бесплатного Firebase Hosting
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: false, // Включена проверка TypeScript
  },

  eslint: {
    ignoreDuringBuilds: false, // Включена проверка ESLint
  },

  images: {
    unoptimized: true, // ✔ обязательно при static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
