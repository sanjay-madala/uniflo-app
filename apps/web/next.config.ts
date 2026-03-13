import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@uniflo/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
