import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones on the local network open the dev server (e.g. http://192.168.1.64:3100).
  allowedDevOrigins: ["192.168.1.64", "192.168.*.*"],
  cacheComponents: true,
  // ~5,200 product pages are prerendered; give slower build machines (e.g. Cloudflare Workers Builds) room.
  staticPageGenerationTimeout: 180,
  partialPrefetching: true,
  experimental: {
    // The on-disk dev cache served stale globals.css after edits (Tailwind loader); off for the prototype.
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    // Prototype default market. The real site suggests one from the browser (Script S3).
    return [{ source: "/", destination: "/pl-pl", permanent: false }];
  },
};

export default nextConfig;
