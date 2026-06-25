import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display serif — carries the "research & scholarship" voice in headlines.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

const TITLE = "MarketLens — Learn the Markets Like a Professional";
const DESCRIPTION =
  "Free equity research, live market data, hands-on paper trading, and a complete investing course — built for students worldwide, at zero cost.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · MarketLens",
  },
  description: DESCRIPTION,
  applicationName: "MarketLens",
  keywords: [
    "stock research", "paper trading", "learn investing", "stock market for beginners",
    "free finance education", "equity research", "live stock prices", "investing course",
  ],
  authors: [{ name: "MarketLens" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-maskable.svg",
  },
  openGraph: {
    type: "website",
    siteName: "MarketLens",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: "MarketLens",
    statusBarStyle: "black-translucent",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#00b84a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
