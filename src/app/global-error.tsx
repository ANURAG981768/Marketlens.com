"use client";

import { useEffect } from "react";

// Last-resort boundary: catches errors thrown in the ROOT layout itself (which
// `error.tsx` cannot). It replaces the entire document, so styles are inlined —
// it must look intact even if the stylesheet never loaded. The whole point is
// that the user never sees a blank white React crash screen.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          background: "#0a0e0d",
          color: "#f5f5f4",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#00b84a",
              marginBottom: 16,
            }}
          >
            MarketLens
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 600, margin: "0 0 12px" }}>
            We hit an unexpected snag
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#a8a29e", margin: "0 0 28px" }}>
            The app ran into an error while loading. Your data is safe — nothing
            was lost. Reload and you&apos;ll be right back where you were.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "12px 24px",
                borderRadius: 999,
                background: "#00b84a",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "12px 24px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#e7e5e4",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Reload home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
