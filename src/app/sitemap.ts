import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The app is a single-page experience (tabs, not separate routes), so the
// homepage is the canonical entry point search engines should index.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
