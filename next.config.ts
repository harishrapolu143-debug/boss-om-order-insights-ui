import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/boss-order-insights',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;