import { ImageResponse } from "next/og";

// Branded social-share preview (WhatsApp / X / LinkedIn) — auto-wired by Next.
export const alt = "MarketLens — Learn the markets like a professional";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(150deg, #15213b 0%, #0b1120 56%, #070b15 100%)",
          borderTop: "10px solid #c9a227",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "36px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#00b84a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 700,
              color: "#06210f",
              
            }}
          >
            M
          </div>
          <div style={{ display: "flex", fontSize: "40px", fontWeight: 700 }}>
            <span style={{ color: "#ffffff" }}>Market</span>
            <span style={{ color: "#1fd35e" }}>Lens</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "78px", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-2px" }}>
          Learn the markets like a professional.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "30px",
            color: "#9fb0c8",
            marginTop: "32px",
            
          }}
        >
          Live data · Paper trading · A full investing course — free, for every student.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "44px" }}>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: "999px",
              background: "rgba(0,184,74,0.15)",
              border: "1px solid rgba(31,211,94,0.5)",
              color: "#1fd35e",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            100% Free
          </div>
          <div style={{ display: "flex", fontSize: "24px", color: "#c9a227" }}>marketlens-com.vercel.app</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
