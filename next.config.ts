import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionally ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
