import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // Experimental features
  experimental: {
    // Enable server actions if needed
    serverActions: {},
  },

  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization configuration
  images: {
    domains: ["localhost"],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Disable ESLint during builds (useful for Vercel CI). It doesn't affect local dev.
  // Set to true only on Vercel to keep local safety nets.
  eslint: {
    ignoreDuringBuilds: process.env.VERCEL === "1",
  },

  // Optionally ignore TypeScript build errors on Vercel only
  // This lets the deployment continue even if there are TS issues.
  // Keep it false locally to catch problems during development.
  typescript: {
    ignoreBuildErrors: process.env.VERCEL === "1",
  },
};

export default nextConfig;
