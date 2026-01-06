import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  // This creates a self-contained build in .next/standalone
  output: "standalone",

  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production" ? true : false,
  },
};

export default nextConfig;
