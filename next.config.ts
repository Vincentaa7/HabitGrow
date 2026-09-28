import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'canvas-confetti',
      '@tanstack/react-query',
    ],
  },
};

export default nextConfig;
