import type { MetadataRoute } from "next";

// A pitch prototype, not the live shop: ask crawlers to stay out.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
