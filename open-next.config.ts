import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every page is prerendered at build time and nothing revalidates, so the cache is served read-only
// from the deployed static assets (no R2 bucket needed).
const config = {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
  }),
  // `npm run build` IS the Cloudflare build (so the dashboard defaults work); Next itself is built directly here.
  buildCommand: "npx next build",
};

export default config;
