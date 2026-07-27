import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["http://localhost:81", "http://127.0.0.1:81", "http://localhost", "http://127.0.0.1"],
};

export default nextConfig;
