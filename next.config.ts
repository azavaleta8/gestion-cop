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
};

export default nextConfig;
