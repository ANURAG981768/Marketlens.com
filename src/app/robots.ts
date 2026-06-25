import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Tells search engines they may crawl the public app, but not the API or the
// per-certificate verification pages (those carry names and aren't useful in
// search). Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/verify/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
