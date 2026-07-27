import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["82.114.179.199", "192.168.100.163", "localhost:3000", "*.179.199", "*"],
  devIndicators: false,
};

export default nextConfig;
