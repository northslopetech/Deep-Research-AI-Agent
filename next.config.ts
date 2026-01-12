import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  // This creates a self-contained build in .next/standalone
  output: "standalone",

  // Keep console.info for logging (only remove console.log/debug in prod)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["info", "warn", "error"] }
      : false,
  },
};

export default nextConfig;
