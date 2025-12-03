/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/], // важно для output: export
});

const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

module.exports = withPWA(nextConfig);
