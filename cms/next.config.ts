import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const configDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: configDir,
  },
};

export default nextConfig;
