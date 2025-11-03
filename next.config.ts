import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "tailark.com",
      },
      {
        protocol: "https",
        hostname: "html.tailus.io",
      },
    ],
  },
};

export default withMDX(nextConfig);
