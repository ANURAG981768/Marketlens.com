import type { MetadataRoute } from "next";

// Makes MarketLens installable to a phone's home screen as an app —
// important for the mobile-first students this platform serves.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MarketLens — Equity Research & Education",
    short_name: "MarketLens",
    description:
      "Free equity research, live market data, paper trading, and financial education for students worldwide.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#00b84a",
    orientation: "portrait-primary",
    categories: ["finance", "education"],
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
