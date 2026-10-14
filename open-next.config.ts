import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every page is prerendered at build time and nothing revalidates, so the cache is served read-only
// from the deployed static assets (no R2 bucket needed).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
