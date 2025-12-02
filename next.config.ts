import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = withPWA({
  dest: 'public', // куда будет экспорт
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // отключаем PWA в dev
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
  output: 'export',  // главный параметр для static export
  distDir: 'public', // экспортируем прямо в public
});

export default nextConfig;
