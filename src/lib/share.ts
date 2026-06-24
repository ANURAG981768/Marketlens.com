// User-initiated sharing. Opens the device's native share sheet when available
// (mobile), otherwise copies the message to the clipboard. The user always
// chooses where it goes — nothing is posted automatically.
export const SITE_URL = "https://marketlens-com.vercel.app";

export async function shareText(text: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator === "undefined") return "failed";
  const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string; url?: string }) => Promise<void> };
  if (typeof nav.share === "function") {
    try {
      await nav.share({ title: "MarketLens", text, url: SITE_URL });
      return "shared";
    } catch (e) {
      // User dismissed the sheet — don't fall through to a surprise clipboard write.
      if (e instanceof Error && e.name === "AbortError") return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${SITE_URL}`);
    return "copied";
  } catch {
    return "failed";
  }
}
