import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ffxiv-guide-engine/ui", "@ffxiv-guide-engine/types"]
};

export default nextConfig;
